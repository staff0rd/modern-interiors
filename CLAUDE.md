# Project instructions

## Nav headers

Every top-level nav/header bar MUST include the itch.io link. Use the shared
`ItchioLink` component (`src/browse/ItchioLink.tsx`), pushed to the right of the
bar with `marginLeft: "auto"`. This applies to all routes/views with their own
header (browse, edit/`EditorHeader`, `/generate`, and any new ones). When you add
a new view with a nav bar, include `ItchioLink` in it.
