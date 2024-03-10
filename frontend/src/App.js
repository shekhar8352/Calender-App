import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useEffect, useState } from 'react';
import "react-datetime-picker/dist/DateTimePicker.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function App() {
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState("");
  const [ eventDescription, setEventDescription ] = useState("");

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

      console.log("Time: ", timeMin, timeMax);

      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`,
          {
            method: "GET",
            headers: {
              'Authorization':'Bearer ' + session.provider_token // Access token for google
            },
          }
        );

        const data = await response.json();
        console.log("Data: ", data);
        setEvents(data.items || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [date]);
  
  if(isLoading) {
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error) {
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
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization':'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Event created, check your Google Calendar!");
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
              padding: "10px",
              backgroundColor: "#eee",
            }}
          >
            <div>
              {session
                ? `Logged in as: ${session.user.email}`
                : "Not logged in"}
            </div>
            {session && <button onClick={signOut}>Sign Out</button>}
          </nav>
          <div>
            <Calendar onChange={setDate} value={date} />
          </div>
          <div>
            <h3>Events on {date.toDateString()}</h3>
            <ul>
              {events.map((event) => (
                <li key={event.id}>{event.summary}</li>
              ))}
            </ul>
          </div>
          {/* <button onClick={openAddActivityPopup}>Add Activity</button>
          {isAddActivityOpen && (
            <AddActivity onClose={closeAddActivityPopup} />
          )} */}
          <h2>Hey there {session.user.email}</h2>
          <p>Start of your event</p>
          <DateTimePicker onChange={setStart} value={start} />
          <p>End of your event</p>
          <DateTimePicker onChange={setEnd} value={end} />
          <p>Event name</p>
          <input type="text" onChange={(e) => setEventName(e.target.value)} />
          <p>Event description</p>
          <input type="text" onChange={(e) => setEventDescription(e.target.value)} />
          <hr />
          <button onClick={() => createCalendarEvent()}>Create Calendar Event</button>
          <p></p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <>
          <button onClick={() => googleSignIn()}>Sign In With Google</button>
        </>
      )}
    </div>
  </div>
  );
}

export default App;