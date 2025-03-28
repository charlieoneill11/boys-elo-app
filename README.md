# Boys Elo Rating App

A web application that provides an Elo rating system for weekly video updates from four players: Max Kirkby, Will Dixson, Charlie O'Neill, and Loki Bromilow.

## Features

- Head-to-head comparison of players with a visual interface
- Elo leaderboard showing current ratings
- Week-by-week graph tracking Elo changes over time
- Clean black and white design with Helvetica Now font
- Calendar week-based tracking (automatically uses the current week)

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- MongoDB (via Mongoose)
- Chart.js for visualizations
- Tailwind CSS for styling
- Railway for deployment

## Setup for Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd boys_elo_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Add profile images for players:
   Place images named `max.jpg`, `will.jpg`, `charlie.jpg`, and `loki.jpg` in the `public/images` directory.

5. Add font files (if using Helvetica Now):
   Place the font files in the `public/fonts` directory or update the CSS to use alternative fonts.

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Seed the database:
   Navigate to `http://localhost:3000/api/seed` in your browser to initialize the database with the four players.

## Deployment to Railway

1. Create a new project in Railway.

2. Connect your GitHub repository.

3. Add a MongoDB service to your project.

4. Set the environment variable:
   ```
   MONGODB_URI=your_railway_mongodb_connection_string
   ```

5. Deploy the application.

## Usage

1. The initial page displays all four players and allows you to select two for comparison.

2. Each week's videos are compared within their calendar week (Monday-Sunday).

3. To record a match result:
   - Select two players to compare weekly videos
   - Click the "[Player Name] Wins" button under the player who had the better video

4. The Elo leaderboard displays current ratings for all players.

5. The Elo chart shows the progression of ratings over time, automatically organizing by week.
