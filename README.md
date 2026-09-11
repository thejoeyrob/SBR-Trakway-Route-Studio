# Sunbelt Rentals · Trakway Route Studio 3.0
Design & Production by Joseph Whelan EDS

## Publish to GitHub Pages
1. Unzip this package. The files are deliberately flat: index.html belongs at the repository root.
2. Upload every extracted file to your chosen GitHub repository and commit the upload.
3. Open the repository Settings → Pages. Choose Deploy from a branch, your main branch, and / (root), then Save.
4. Wait for the Pages deployment to finish. Open the HTTPS address GitHub displays.
5. On iPhone / iPad, open that address in Safari → Share → Add to Home Screen. On Android, use Chrome → menu → Install app. Chrome and Edge desktop can also offer installation.

Do not open index.html directly from Files to assess GPS, map lookup or installation. These features need a hosted HTTPS origin. There is no Node build step, package installation or backend required. All paths are relative so a repository subfolder URL is supported.

## First plan
Search a UK postcode or latitude, longitude. Or press the target button and allow current location. Adjust the map, press Use this area, choose a panel and route width, and draw route points or a pad boundary. Press Finish. On phones/tablets, the layers button opens the tools. Lock map · draw freezes the view and swaps map controls for the drawing toolbar. Unlock · move map restores pan/zoom. While locked, empty-space drags and two-finger gestures cannot move the map; a single finger moves selected objects or highlighted control points. Multi-select in the floating selection bar selects separate objects on touchscreens.

Map panels are represented in metres in a local coordinate system derived from Web Mercator, corrected for the site latitude. Keep each project to one site. Local scale varies with latitude across large distances. Maps are north-up. Satellite imagery is an online basemap, not real-time photography and not a surveyed site drawing. GPS accuracy is shown with an uncertainty circle.

### Map sources
Esri World Imagery is the default online satellite source. OpenStreetMap is the street source. Grid needs no tiles. Both sources are publicly accessible at the time this build was prepared; provider availability, coverage and terms can change. Attribution is retained in the app and exports. Requests only load the map viewport; no bulk/offline tile download is implemented.

Live-map projects store geographic references and drawings, and reload imagery online. They do not embed or cache an offline tile collection. PNG/PDF exports capture the currently loaded visible map with attribution. Use the imagery under the provider's terms. For a durable offline plan, upload a map image you are entitled to use and calibrate it.

### Optional connections
Settings → Connections & preferences:
- **what3words**: enter your API key with an account/plan enabled for coordinate conversion. Search ///three.word.address or use the /// button on the selected location. Reverse conversion uses the selected pin, or map centre if no pin exists. Without a key you can open a typed three-word address on what3words, but in-app conversion is not active.
- **Mapbox**: a public access token beginning pk. enables full street-address search and optional Mapbox satellite imagery. Restrict the token to your deployed origins. Address searches use the permanent geocoding parameter because locations may be saved in project files; the account must support permanent geocoding and may incur usage charges. Postcode lookup does not require this connection.
- By default keys are held in memory for the session. Explicitly choose Remember keys to store them in localStorage on this device. Keys entered in Settings never enter .trakway exports, saved projects, materials CSVs or the service worker cache. Deployment keys in config.js are part of the cached public app files.
- config.js can contain browser-safe deployment keys for your organisation. They are visible in a static site: never use a secret server key. what3words keys used in a static browser client are visible to that client; use available provider restrictions. A server proxy can be added later if central secret management is required.

## Existing v1.0.1 projects
Open .trakway project supports calibrated legacy files containing the original embedded PNG, JPEG or WebP image. Panels, accessories, measurements, groups and text/shape annotations are converted to metres. Existing dimensions are preserved. Legacy files with no usable scale cannot be imported because their panel positions cannot be converted reliably.

## Materials and editing
Product dimensions initially match the supplied v1.0.1 application:
- Lion Panel: 2.41 × 3.00 m
- Hybrid Panel: 2.44 × 3.00 m
- TuffTrak: 2.50 × 3.00 m
- Sabre-X: 1.80 × 3.80 m
Confirm the dimensions for the exact products used. Edit new-panel dimensions in Settings. Existing panels keep their stored dimensions.
Routes use whole panels and may extend beyond the final route point. Freehand strokes are simplified into straight sections. Generated route panels do not overlap each other; conflicting positions are omitted. Orange markers identify bends needing joint review, so omitted panels can leave gaps requiring an appropriate diversion or manual adjustment. Optional Sabre lateral shifts are limited to 100, 200 or 300 mm and applied only when they resolve a conflict. Each straight section is edge-snapped; this is not a certified connection design. Pads fit whole, uniformly aligned panels inside the exact polygon, without stagger or boundary spill. Choose longest edge, last route direction or an entered angle; irregular edges can remain unfilled. Manual objects and separate routes can still overlap each other. The schedule is an object count, not an engineering validation or allowance for site tolerances. The displayed panel area sums panel footprints, including overlaps. Assess ground conditions, loads, connections and installation requirements separately.

Tap selected objects to move them; use the floating bar to edit, rotate, duplicate, group or delete. Ctrl/Cmd+A selects all, Ctrl/Shift click extends selection. Undo/redo tracks drawing changes. Snapping joins matching edges at matching angles; rotate objects into alignment first. The 12,000-object guard prevents runaway route generation.

## Save, export and offline use
- Automatic recovery saves the most recent plan in IndexedDB on this browser/device.
- Save to my projects keeps named local copies. Starting a new plan saves the existing plan first.
- Download editable project transfers it to another device. Local projects do not automatically sync.
- PNG exports at 2,000 pixels wide. Set a paper frame to crop the drawing to an A4 landscape/portrait ratio, including a visible title band. Without a frame the current viewport is exported. A saved frame outside the visible viewport must be reframed before export.
- Print / save as PDF uses the browser print dialog with the map, materials schedule, notes and location.
- CSV downloads the materials schedule with project information.
- The service worker stores only same-origin app assets. Live maps, postcode search and what3words need internet. Uploaded image projects can work offline after the app has loaded online.
- Browser storage can be evicted or cleared. Keep downloaded project backups.
- To update: replace all deployment files together and increase the service-worker cache version. Close existing app tabs and reopen after an update so the new worker activates.

## Privacy and connections
GPS runs only when the location button is pressed and the user grants permission. Search sends the supplied query to the selected location service. what3words conversion sends the supplied words or selected coordinates to what3words. Map providers receive tile requests for the viewed area. No analytics, account login or project-upload backend is built in. Anyone with the hosted app URL can open the static app; restricting access requires an authentication backend or hosting access control. Individual projects stay on the device until exported.

## Dependencies and references
Leaflet 1.9.4 is bundled locally under its BSD 2-clause licence (LEAFLET-LICENSE.txt).
Brand assets: Sunbelt Rentals official website and the supplied Danco application's Joseph Whelan EDS credit asset.
- https://leafletjs.com/
- https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9
- https://operations.osmfoundation.org/policies/tiles/
- https://postcodes.io/docs/api/lookup-postcode/
- https://developer.what3words.com/public-api/docs
- https://docs.mapbox.com/api/search/geocoding/
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Drawing tools in v3
- **Route · tap points**: no cursor-to-endpoint preview. Only deliberately added points form the draft line.
- **Route · freehand**: draw one stroke, lift, edit its simplified points, then Finish. Choose single or double wide.
- **Area · freehand / tap boundary**: trace the perimeter, adjust its points, then Finish to fill with full panels. Crossing boundaries are rejected. Freehand areas retain the recorded outline rather than smoothing it outward.
- Tap a point to highlight it and drag to move it. Delete point removes the highlighted point. Undo removes the last draft point.
- Select a completed, otherwise unmodified route/area and choose **Edit route points** to regenerate it. Manual panel movement, rotation, deletion or dimensions changes detach that layout from its original control path; the panels remain editable.
- **Options** includes area alignment, Sabre offset limit, construction symbols and grouped diversion assemblies. **Labels & accessories** opens the existing detailed controls.
- Construction symbols include articulated / rigid trucks, mobile crane, excavator, OHL goalposts and barriers. Dimensions are schematic defaults; select Edit to match the actual plant footprint. Symbols are not manufacturer drawings, safe clearance zones or load diagrams.
- **Measure line** creates an editable, exported dimension in metres.
- **Paper frame** enables composition with map, panels and assets geographically tied together. Pan and pinch to compose. Turn two fingers beyond 45° to snap the paper orientation through 90°, or use Rotate 90°. Set perimeter returns to locked drawing. The bottom band reserves space for the exported title, attribution and scale bar.

## Local plan / overhead-line reference layers
Both layers are drawing-only, loaded by an explicit button press. Nothing is queried while scrolling the map. Unlocking hides them. Turning a layer back on at a new site loads that local area.

**Plan view** draws actual OSM building footprints, road/path centrelines, waterways, mapped wooded/grass/water areas and tree locations in monochrome. It does not vectorise satellite images or invent missing details, tree canopies or road widths. Multipolygon relations are not included in this first plan renderer, so some large/complex mapped features may be absent. The query radius fits the viewport up to a maximum of 800 metres.

**Overhead lines** queries OSM power=tower / power=pole nodes and power=line / power=minor_line ways within 1,609.344 metres (one mile) of the locked view centre. Click a pole/tower in Select mode for recorded operator, reference, voltage, material and other available tags, with a source link. Most tags may be absent. This is not a complete UK asset register: no markers does not mean no overhead lines. Confirm assets, line height/sag and working arrangements with the network operator. The app calculates no safe clearance.

The public Overpass endpoint is provided by Private.coffee; a deployment may set `overpassEndpoint` in config.js to a compatible HTTPS endpoint. There is one request at a time, a 30-second request cooldown, a one-hour session cache (maximum six areas), a 25-second timeout, a four-megabyte response cap and an 1,800-element display cap. Partial/capped results are labelled or rejected. Requests send the chosen site coordinates to the endpoint. These layers require internet and are not stored as offline map datasets; exports include currently enabled reference layers and attribution. Public-service availability is outside the app's control.

Sources:
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://wiki.openstreetmap.org/wiki/Tag:power=tower
- https://wiki.openstreetmap.org/wiki/Tag:power=pole
- https://www.hse.gov.uk/electricity/information/overhead.htm

## Validation performed
JavaScript syntax, static asset paths, unique HTML IDs, PWA manifest and service-worker entries checked. Geometry checks cover exact single/double runs, shaky-line simplification, five bend angles in single/double width with no generated panel overlap, the 300 mm cap, concave and narrow-notch boundary containment, alignment, paper ratios, symbol project roundtrips and geographic coordinate roundtrips.

No browser/device UI test was performed. GPS permission, multi-touch behaviour and account-dependent what3words/Mapbox conversions need confirmation on the target device. A live request to the public Overpass service timed out during preparation; the app handles timeout/unavailable responses and keeps the drawing usable. No App Store certification or engineering approval is claimed.
