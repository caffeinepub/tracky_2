import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  type StudySession = {
    startTime : Time.Time;
    endTime : Time.Time;
    completed : Bool;
    chapterId : ?Text;
  };

  type UserSettings = {
    workDuration : Int; // in minutes
    breakDuration : Int; // in minutes
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
  };

  type SessionWithDay = {
    session : StudySession;
    day : Int;
  };

  let loggedInUsers = Map.empty<Principal, Bool>();
  let userSessions = Map.empty<Principal, [StudySession]>();
  let userSettings = Map.empty<Principal, UserSettings>();
  let userStreaks = Map.empty<Principal, StreakData>();
  let userChapters = Map.empty<Principal, Map.Map<Text, SyllabusChapter>>();

  public shared ({ caller }) func login() : async () {
    if (loggedInUsers.containsKey(caller)) {
      Runtime.trap("User already logged in");
    } else {
      loggedInUsers.add(caller, true);
      // Initialize default settings if not present
      if (not userSettings.containsKey(caller)) {
        userSettings.add(caller, { workDuration = 25; breakDuration = 5 });
      };
    };
  };

  public shared ({ caller }) func logout() : async () {
    if (loggedInUsers.containsKey(caller)) {
      loggedInUsers.remove(caller);
    } else {
      Runtime.trap("User not logged in");
    };
  };

  public shared ({ caller }) func startSession(startTime : Time.Time, chapterId : ?Text) : async () {
    assertLoggedIn(caller);
    let newSession : StudySession = {
      startTime;
      endTime = 0;
      completed = false;
      chapterId;
    };
    let existingSessions = switch (userSessions.get(caller)) {
      case (null) { [newSession] };
      case (?sessions) { sessions.concat([newSession]) };
    };
    userSessions.add(caller, existingSessions);
  };

  public shared ({ caller }) func endSession(endTime : Time.Time) : async () {
    assertLoggedIn(caller);
    switch (userSessions.get(caller)) {
      case (null) {};
      case (?sessions) {
        if (sessions.size() > 0) {
          let lastIndex = sessions.size() - 1;
          var updatedSessions = sessions.toVarArray<StudySession>();
          if (lastIndex < updatedSessions.size()) {
            updatedSessions[lastIndex] := {
              sessions[lastIndex] with
              endTime;
              completed = true;
            };
            userSessions.add(caller, updatedSessions.toArray());
            updateStreak(caller);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateSettings(workDuration : Int, breakDuration : Int) : async () {
    assertLoggedIn(caller);
    let settings : UserSettings = {
      workDuration;
      breakDuration;
    };
    userSettings.add(caller, settings);
  };

  public shared ({ caller }) func createChapter(title : Text, subject : Text, notes : ?Text) : async () {
    assertLoggedIn(caller);
    let chapterId = title.concat(subject);
    let chapter : SyllabusChapter = {
      id = chapterId;
      title;
      subject;
      notes;
    };

    let userSpecificChapters = switch (userChapters.get(caller)) {
      case (null) {
        let map = Map.empty<Text, SyllabusChapter>();
        map.add(chapterId, chapter);
        map;
      };
      case (?chapters) {
        chapters.add(chapterId, chapter);
        chapters;
      };
    };
    userChapters.add(caller, userSpecificChapters);
  };

  public shared ({ caller }) func editChapter(chapterId : Text, newTitle : Text, newSubject : Text, newNotes : ?Text) : async () {
    assertLoggedIn(caller);
    switch (userChapters.get(caller)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?chapters) {
        if (not chapters.containsKey(chapterId)) {
          Runtime.trap("Chapter not found");
        };
        let updatedChapter : SyllabusChapter = {
          id = chapterId;
          title = newTitle;
          subject = newSubject;
          notes = newNotes;
        };
        chapters.add(chapterId, updatedChapter);
      };
    };
  };

  public shared ({ caller }) func deleteChapter(chapterId : Text) : async () {
    assertLoggedIn(caller);
    switch (userChapters.get(caller)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?chapters) {
        if (not chapters.containsKey(chapterId)) {
          Runtime.trap("Chapter not found");
        };
        chapters.remove(chapterId);
      };
    };
  };

  public query ({ caller }) func getChapters() : async [SyllabusChapter] {
    switch (userChapters.get(caller)) {
      case (null) { [] };
      case (?chapters) {
        chapters.values().toArray();
      };
    };
  };

  public query ({ caller }) func getSessions() : async [StudySession] {
    switch (userSessions.get(caller)) {
      case (null) { [] };
      case (?sessions) { sessions };
    };
  };

  public query ({ caller }) func getCurrentStreak() : async Int {
    switch (userStreaks.get(caller)) {
      case (null) { 0 };
      case (?streak) { streak.currentStreak };
    };
  };

  public query ({ caller }) func getStatistics() : async {
    dailyStudyTime : [(Int, Int)];
    weeklyTrends : [(Int, Int)];
    sessionDistribution : [(Int, Int)];
  } {
    let daily = computeDailyStudyTime(caller);
    let weekly = computeWeeklyTrends(caller);
    let distribution = computeSessionDistribution(caller);
    {
      dailyStudyTime = daily;
      weeklyTrends = weekly;
      sessionDistribution = distribution;
    };
  };

  public query ({ caller }) func getSettings() : async UserSettings {
    switch (userSettings.get(caller)) {
      case (null) { { workDuration = 25; breakDuration = 5 } };
      case (?settings) { settings };
    };
  };

  func assertLoggedIn(caller : Principal) {
    if (not loggedInUsers.containsKey(caller)) {
      Runtime.trap("User not logged in");
    };
  };

  func updateStreak(user : Principal) {
    let today = Int.abs(Time.now() / (24 * 60 * 60 * 1_000_000_000));
    let currentStreak = switch (userStreaks.get(user)) {
      case (null) { 0 };
      case (?data) { data.currentStreak };
    };
    let lastDay = switch (userStreaks.get(user)) {
      case (null) { 0 };
      case (?data) { data.lastSessionDay };
    };

    if (lastDay == today - 1 or lastDay == 0) {
      let newStreak = {
        currentStreak = if (lastDay == 0) { 1 } else {
          currentStreak + 1;
        };
        lastSessionDay = today;
      };
      userStreaks.add(user, newStreak);
    } else if (lastDay != today) {
      let resetStreak = { currentStreak = 1; lastSessionDay = today };
      userStreaks.add(user, resetStreak);
    };
  };

  func computeDailyStudyTime(_user : Principal) : [(Int, Int)] {
    [(0, 0)];
  };

  func computeWeeklyTrends(_user : Principal) : [(Int, Int)] {
    [(0, 0)];
  };

  func computeSessionDistribution(_user : Principal) : [(Int, Int)] {
    [(0, 0)];
  };
};
