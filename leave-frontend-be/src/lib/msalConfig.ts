import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "6145da12-853d-4708-84ac-4f08da0e1a6f",
    authority: "https://login.microsoftonline.com/22081f0f-9d48-4eab-a41d-78eeb43225cf",
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any) => {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false
    }
  }
};

export const loginRequest = {
  scopes: [
    "api://6145da12-853d-4708-84ac-4f08da0e1a6f/Leave.ReadWrite",
    "User.Read"
  ]
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphPhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value"
}; 