import { Box } from "lucide-react";
import Button from "./button";

import {useOutletContext} from "react-router";

const Navbar = () => {
    const {isSignedIn, userName,signIn,signOut} = useOutletContext<AuthContext>();
  const handleAuthClick = async () => {
      if (isSignedIn){
          try {
              await signOut();
          }catch (e) {
              console.log(`Puter Sign Out failed : ${e}`)
          }
          return
      }
      try{
          await signIn();
      }
      catch (e){
          console.log(`Puter Sign In failed : ${e}`)
      }

  };

  const handleGetStarted = () => {
    if (!isSignedIn) {
      void handleAuthClick();
    }
  };


  return (
    <header className="navbar shadow-xs">
      <div className="nav">
        <Box className="logo"></Box>
        <div className="ml-2">Roomify</div>
      </div>
      <ul className="links">
        <a href="#">Product</a>
        <a href="#">Pricing</a>
        <a href="#">Community</a>
        <a href="#">Enterprise</a>
      </ul>

      <div className="actions flex items-center gap-2">
          {isSignedIn ?(
              <>
                  <span className="greetings">
                      {userName ?`Hi,${userName} `:
                          'You are logged in'
                      }
                  </span>
                   <Button onClick={handleAuthClick} >Logout</Button>
              </>

          ):(
              <>
              <Button variant="ghost" size="sm" onClick={handleAuthClick}>
               Login
             </Button>
                  <Button variant="primary" size="sm" onClick={handleGetStarted}>
            Get Started
        </Button>
              </>

        )
        }

      </div>
    </header>
  );
};

export default Navbar;
