# Team logo mapping (CSV)

`collegeData.csv` has two extra columns:

- **LogoLight** – slug for the light logo file (e.g. `abilene-christian` → `/team-logos/abilene-christian.svg`).
- **LogoDark** – slug for the dark logo file (e.g. `abilene-christian` → `/team-logos/abilene-christian-dark.svg`).

**Convention:**

- If a school has **both** light and dark SVGs: put the same base slug in both columns (e.g. `abilene-christian`,`abilene-christian`).
- If a school has **only a light** logo: put the slug in LogoLight and leave LogoDark empty (e.g. `berea`,`""`).
- If a school has **only a dark** logo: leave LogoLight empty and put the slug in LogoDark (e.g. `""`,`alcorn`).

Slug = filename without `.svg` or `-dark.svg`. Check `public/team-logos/*.svg` for exact filenames.
