# Specification

## Summary
**Goal:** Add syllabus chapter tracker to organize study sessions by subject.

**Planned changes:**
- Create backend data model for syllabus chapters with title, subject, and optional notes fields
- Associate study sessions with specific chapters by adding chapter reference to session records
- Build frontend component for managing chapters with list view and add/edit/delete functionality
- Add chapter selection dropdown to Pomodoro timer for associating sessions with chapters
- Enhance session history view to display associated chapter names and filter by chapter
- Add chapter-level statistics showing total study time and session count per chapter with visual breakdown

**User-visible outcome:** Users can create and manage syllabus chapters, associate study sessions with specific chapters during Pomodoro sessions, view which chapter each session was for in the history, and see study time statistics broken down by chapter.
