import "./App.css";
import {
  useSession,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import DateTimePicker from "react-datetime-picker";
import { useEffect, useState } from "react";
import "react-datetime-picker/dist/DateTimePicker.css";
import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false); // New state

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events for the selected date
    const fetchEvents = async () => {
      const timeMin = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
      ).toISOString();
      const timeMax = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
        0,
        0,
        0
      ).toISOString();

      // console.log("Time: ", timeMin, timeMax);

      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + session.provider_token, // Access token for google
            },
          }
        );

        const data = await response.json();
        // console.log("Data: ", data);
        setEvents(data.items || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [date]);

  if (isLoading) {
    return <></>;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
      end: {
        dateTime: end.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
    };
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.provider_token, // Access token for google
        },
        body: JSON.stringify(event),
      }
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
        setIsAddActivityOpen(false);
      });
  }

  return (
    <div className="App">
      <div style={{ width: "100%" }}>
        {session ? (
          <>
            <nav
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 50px",
                backgroundColor: "#000",
                color: "#fffff",
              }}
            >
              <div style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "18px"
              }}>{session ? session.user.email : "Not logged in"}</div>
              {session && (
                <button className="sign-out-btn" onClick={signOut}>
                  Sign Out
                </button>
              )}
            </nav>
            <h1
              style={{
                textAlign: "center",
                alignItems: "center",
              }}
            >
              Activity Tracker
            </h1>
            <div className="main-body">
              <div className="calender-body">
                <Calendar onChange={setDate} value={date} />
              </div>
              <div className="activity-wrap">
                <div className="activity-list">
                  <h3
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    Activities on {date.toDateString()}
                  </h3>
                  <ul>
                    {events.map((event) => (
                      <li key={event.id}>
                        <strong>{event.summary}</strong>
                        <br />
                        {event.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="activity-btn-div">
              <button
                className="add-activity-button"
                onClick={() => setIsAddActivityOpen(!isAddActivityOpen)}
              >
                Add Activity
              </button>
            </div>
            {/* <hr /> */}
            {isAddActivityOpen && (
              <>
                <div className="add-activity">
                  <h2
                    style={{
                      textAlign: "center",
                      alignItems: "center",
                    }}
                  >
                    Add an event
                  </h2>
                  <div className="inputs">
                    <label>Start of your activity:</label>
                    <DateTimePicker onChange={setStart} value={start} />
                  </div>
                  <div className="inputs">
                    <label>End of youractivity:t</label>
                    <DateTimePicker onChange={setEnd} value={end} />
                  </div>
                  <div className="inputs">
                    <label>Activity name</label>
                    <input
                      className="text-input"
                      type="text"
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div className="inputs">
                    <label>Activity description</label>
                    <input
                      className="text-input"
                      type="textarea"
                      onChange={(e) => setEventDescription(e.target.value)}
                    />
                  </div>
                  <hr />
                  <div className="submit-activity">
                    <button
                      className="submit-activity-btn"
                      onClick={() => createCalendarEvent()}
                    >
                      Create Calendar Activity
                    </button>
                  </div>
                  <p></p>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => googleSignIn()}>Sign In With Google</button>
          </>
        )}
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#000",
            color: "#fff",
            padding: "10px 0px",
            textAlign: "center",
            position: "fixed",
            bottom: "0",
            width: "100%",
          }}
        >
          @Sudhanshu_Shekhar
        </div>
      </div>
    </div>
  );
}

export default App;
