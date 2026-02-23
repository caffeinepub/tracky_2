import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  public type StudySession = {
    startTime : Time.Time;
    endTime : Time.Time;
    completed : Bool;
    chapterId : ?Text;
  };
};

