import { supabase } from "../../lib/supabaseClient";

function parseTimeToFloat(start: string, end: string): number {
  const to24 = (timeStr: string): number => {
    if (!/AM|PM/i.test(timeStr)) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours + (minutes || 0) / 60;
    }
    const [time, meridian] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
    return hours + (minutes || 0) / 60;
  };

  try {
    return parseFloat((to24(end) - to24(start)).toFixed(2));
  } catch {
    return 0;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, term, fetchRemote } = body;

    if (!subject) {
      return Response.json({ error: "Missing subject" }, { status: 400 });
    }

    // Parse subject into dept and code (e.g., "EECS 581" -> dept="EECS", code="581")
    const parts = subject.trim().split(/\s+/);
    if (parts.length < 2) {
      return Response.json(
        { error: 'Invalid subject format. Expected "DEPT CODE"' },
        { status: 400 }
      );
    }

    const dept = parts[0];
    const code = parts[1];

    // Fetch all sections for this course from the database
    const { data: sections, error: fetchErr } = await supabase
      .from("allclasses")
      .select("*")
      .eq("dept", dept)
      .eq("code", code)
      .order("component", { ascending: true })
      .order("classid", { ascending: true });

    if (fetchErr) {
      console.error("Database fetch error:", fetchErr);
      return Response.json(
        { error: "Database query failed", details: fetchErr.message },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      return Response.json({ success: true, data: [] }, { status: 200 });
    }

    // Build course sections from database
    const courseSections = sections.map((section) => {
      const duration = parseTimeToFloat(
        section.starttime || "",
        section.endtime || ""
      );

      return {
        classID: section.classid.toString(),
        uuid: section.uuid,
        component: section.component,
        starttime: section.starttime,
        endtime: section.endtime,
        days: section.days,
        instructor: section.instructor,
        seats_available: section.availseats ?? 0,
        room: section.room,
        location: section.location,
        duration,
      };
    });

    // Build base response
    const responseToFrontend: any = [
      {
        dept: sections[0].dept,
        code: sections[0].code,
        title: sections[0].title,
        description: null,
        sections: courseSections,
      },
    ];

    // Fetch remote data from KU if requested
    if (fetchRemote === true) {
      try {
        // Build form body with correct parameters
        const formBody = new URLSearchParams({
          classesSearchText: `${dept} ${code}`, // Use space, not +
          searchCareer: "Undergraduate",
          searchTerm: term || "",
          searchSchool: "",
          searchDept: "",
          searchSubject: dept, // Explicitly set subject (NEW)
          searchCode: "",
          textbookOptions: "",
          searchAreaOfInterest: "",
          searchCampus: "",
          searchBuilding: "",
          searchCourseNumberMin: code, // Restrict to exact code (NEW)
          searchCourseNumberMax: code, // Restrict to exact code (NEW)
          searchCreditHours: "",
          searchInstructor: "",
          searchStartTime: "",
          searchEndTime: "",
          searchClosed: "false",
          searchHonorsClasses: "false",
          searchShortClasses: "false",
          searchOnlineClasses: "",
          searchIncludeExcludeDays: "include",
          searchDays: "",
        }).toString();

        console.log(
          "[KU API] Sending request - Dept:",
          dept,
          "Code:",
          code,
          "Term:",
          term
        );

        const res = await fetch(
          "https://classes.ku.edu/Classes/CourseSearch.action",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "User-Agent": "Mozilla/5.0",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: formBody,
          }
        );

        const html = await res.text();
        console.log("[KU API] Response status:", res.status);
        console.log("[KU API] HTML length:", html.length);

        // Parse description from HTML - look for content inside <td> after <h3> or in description row
        let description: string | null = null;

        // Try method 1: Find text after <h3> in a <td>
        const h3Match = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
        if (h3Match) {
          const afterH3 = h3Match[1];
          // Find the first <td> after this h3
          const tdAfterH3 = html
            .slice(html.indexOf(h3Match[0]))
            .match(/<td[^>]*>([\s\S]*?)<\/td>/);
          if (tdAfterH3) {
            description = tdAfterH3[1]
              .replace(/<[^>]+>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
        }

        // Try method 2: Find description in the outer table (second row)
        if (!description) {
          const descTableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/);
          if (descTableMatch) {
            const firstTable = descTableMatch[0];
            // Find second row's td
            const rows = firstTable.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
            if (rows.length > 1) {
              const secondRowTds =
                rows[1].match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
              if (secondRowTds.length > 0 && secondRowTds[0]) {
                description = secondRowTds[0]
                  .replace(/<[^>]+>/g, "")
                  .replace(/&nbsp;/g, " ")
                  .replace(/\s+/g, " ")
                  .trim();
              }
            }
          }
        }

        console.log(
          "[KU API] Description found:",
          description ? description.substring(0, 100) : "null"
        );

        if (description) {
          responseToFrontend[0].description = description;
        }

        // Parse seats available from class list table
        const tableMatch = html.match(
          /<table[^>]*class=["']?class_list["']?[^>]*>([\s\S]*?)<\/table>/i
        );
        console.log("[KU API] Table found:", !!tableMatch);

        if (tableMatch) {
          const tableHtml = tableMatch[1];
          // Find rows with class crs_altrow
          const rowMatches =
            tableHtml.match(
              /<tr[^>]*class=["']?crs_altrow["']?[^>]*>[\s\S]*?<\/tr>/gi
            ) || [];
          console.log("[KU API] Rows found:", rowMatches.length);

          for (const row of rowMatches) {
            const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];

            if (cells.length >= 5) {
              // Extract class ID (4th column = cells[3])
              const classIdRaw = cells[3].replace(/<[^>]+>/g, "").trim();
              // Look for <strong> tag which wraps the class number
              const strongMatch = cells[3].match(
                /<strong[^>]*>([\s\S]*?)<\/strong>/i
              );
              const classId = strongMatch ? strongMatch[1].trim() : classIdRaw;

              // Extract seats (5th column = cells[4])
              const seatsRaw = cells[4]
                .replace(/<[^>]+>/g, "")
                .replace(/&nbsp;/g, " ")
                .trim();
              const seats = parseInt(seatsRaw, 10);

              console.log(
                "[KU API] Parsed row - ClassID:",
                classId,
                "Seats:",
                seats
              );

              // Update matching section
              const section = responseToFrontend[0].sections.find(
                (s: any) => s.classID === classId
              );
              if (section && !isNaN(seats)) {
                section.seats_available = seats;
                console.log(
                  "[KU API] Updated section",
                  classId,
                  "with",
                  seats,
                  "seats"
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("[KU API] Failed to fetch remote data:", error);
        // Return database data as fallback
      }
    }

    return Response.json(
      { success: true, data: responseToFrontend },
      { status: 200 }
    );
  } catch (err) {
    console.error("getClassInfo server error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: "Server error", details: errorMessage },
      { status: 500 }
    );
  }
}
