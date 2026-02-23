import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type StudySession = {
    startTime : Time.Time;
    endTime : Time.Time;
    completed : Bool;
    chapterId : ?Text;
  };

  type UserSettings = {
    workDuration : Int;
    breakDuration : Int;
  };

  type StreakData = {
    currentStreak : Int;
    lastSessionDay : Int;
  };

  type SyllabusChapter = {
    id : Text;
    title : Text;
    subject : Text;
    notes : ?Text;
    completed : Bool;
  };

  type OldActor = {
    loggedInUsers : Map.Map<Principal, Bool>;
    userSessions : Map.Map<Principal, [StudySession]>;
    userSettings : Map.Map<Principal, UserSettings>;
    userStreaks : Map.Map<Principal, StreakData>;
    userChapters : Map.Map<Principal, Map.Map<Text, SyllabusChapter>>;
  };

  type NewActor = {};

  public func run(_old : OldActor) : NewActor {
    {};
  };
};
