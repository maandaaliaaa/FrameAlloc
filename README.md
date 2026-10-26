# FrameAlloc — Page/Frame Allocation Algorithms

An interactive browser-based Operating Systems SLA demo for Equal, Proportional, Priority-Based, and simplified Working-Set allocation.

## Run locally
1. Download and extract the ZIP.
2. Open `index.html` in Chrome, Edge, Firefox, or Safari.
3. Change available frames and process sizes.
4. Choose an algorithm and click **Run allocation simulation**.
5. Compare allocations in the comparison table.

No build tools or server are required.

## Files
- `index.html` — interface structure
- `style.css` — responsive dashboard styling
- `script.js` — allocation algorithms, comparison, and UI interaction

## GitHub Pages deployment
1. Create a GitHub repository.
2. Upload these three files to the repository root.
3. Open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for deployment and open the Pages URL shown by GitHub.

## Important scope note
This is an educational allocation simulator. It does not allocate real OS memory. Its working-set policy is a simplified weighted-allocation demonstration. Page-fault rates require page-reference traces and a page replacement policy.
