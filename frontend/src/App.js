import {
  useSession,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import AddActivity from "./Components/AddActivity";
import { useState } from 'react';

function App() {
  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();
  const [isAddActivityOpen, setAddActivityOpen] = useState(false);

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

  const openAddActivityPopup = () => {
    setAddActivityOpen(true);
  };

  const closeAddActivityPopup = () => {
    setAddActivityOpen(false);
  };

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
            <button onClick={openAddActivityPopup}>Add Activity</button>
            {isAddActivityOpen && <AddActivity onClose={closeAddActivityPopup} />}
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
