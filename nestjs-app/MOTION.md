# Motion gallery

The home page's Motion band opens `/motion.html`. The six original Figma exports
are stacked in design order. Scrolling progressively separates them; hovering or
keyboard focus enlarges the active artwork. Touch targets remain at least 64px
high in the collapsed stack. Reduced-motion users and browsers without JavaScript
receive separated artwork.

Each card links to `/motion-project.html?work=01` through `?work=06`. The detail
view reverses the exported trapezoid perspective to show the frame front-on, with
previous/next links and a gallery return link. Unknown IDs show a recovery link.

## Add final content

Edit the six entries in `public/motion-project.js`:

- `title`: approved project title (currently neutral Motion 01–06 labels).
- `description`: approved overview; an honest pending message appears if blank.
- `video`: hosted MP4/WebM URL or a local `/media/...` path; an empty value hides
  the player. Videos use native controls, inline playback, and no autoplay.

When titles change, also update the corresponding visible and accessible labels
in `public/motion.html`. No production videos or invented project credits are
included in this change.

## Design source and assets

Figma file `J3jfxGNBDwFVNBAt37Kq6o`, node `167:546`.
The six PNGs and divider SVG are exact downloaded Figma exports, stored locally
so the temporary Figma URLs are not production dependencies. The original Hepta
Slab, Kiwi Maru, and DM Sans fonts are self-hosted with their OFL licenses. Kiwi
Maru includes the Latin characters used on these pages to reduce download size.

Vercel's existing static routes serve both new HTML pages without configuration
changes or a build step.
