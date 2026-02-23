import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  // Old types
  type OldStudySession = {
    startTime : Time.Time;
    endTime : Time.Time;
    completed : Bool;
  };

  type OldActor = {
    loggedInUsers : Map.Map<Principal, Bool>;
    userSessions : Map.Map<Principal, [OldStudySession]>;
    userSettings : Map.Map<Principal, { workDuration : Int; breakDuration : Int }>;
    userStreaks : Map.Map<Principal, { currentStreak : Int; lastSessionDay : Int }>;
  };

  // New types
  type NewStudySession = {
    startTime : Time.Time;
    endTime : Time.Time;
    completed : Bool;
    chapterId : ?Text;
  };

  type NewActor = {
    loggedInUsers : Map.Map<Principal, Bool>;
    userSessions : Map.Map<Principal, [NewStudySession]>;
    userSettings : Map.Map<Principal, { workDuration : Int; breakDuration : Int }>;
    userStreaks : Map.Map<Principal, { currentStreak : Int; lastSessionDay : Int }>;
    userChapters : Map.Map<Principal, Map.Map<Text, { id : Text; title : Text; subject : Text; notes : ?Text }>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserSessions = old.userSessions.map<Principal, [OldStudySession], [NewStudySession]>(
      func(_p, oldSessions) {
        oldSessions.map<OldStudySession, NewStudySession>(
          func(oldSession) {
            {
              oldSession with
              chapterId = null; // Initialize to null for existing sessions
            };
          }
        );
      }
    );

    {
      old with
      userSessions = newUserSessions;
      userChapters = Map.empty<Principal, Map.Map<Text, { id : Text; title : Text; subject : Text; notes : ?Text }>>();
    };
  };
};
