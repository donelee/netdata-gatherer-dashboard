# Welcome to netdata-gatherer-dashboard project

## Project info

**prompt word**: Create a web application that aggregates and displays monitoring data from multiple local network Netdata instances. It should include a settings page for configuring Netdata API URLs, and a main dashboard for displaying user-selected metrics.

On the settings page, add multiple input fields for users to enter custom API names and URLs for the Netdata APIs (e.g., http://192.168.1.10:19999). Add a button to save these custom API names and URLs. The saved custom API names and URLs should be stored in the browser's local storage. My local network Netdata instances do not require any usernames or passwords to access their APIs.

After the user saves the custom Netdata API names and URLs, for each URL, send an API request to /api/v1/allmetrics to retrieve the list of available metrics. On the settings page, display these metrics with a checkbox next to each one, allowing users to select the metrics they want to see on the main dashboard. Add a 'Save Metric Selections' button.

Create a main dashboard page that displays the data for the metrics selected by the user on the settings page. For each selected metric, fetch the latest values from the corresponding Netdata API using the appropriate API endpoint (e.g., /api/v1/data?chart={metric_name}). Display each metric in a separate module with a clear module title showing the metric name and the custom name of the source Netdata instance.

Ensure the web application has a responsive design that works well on desktop browsers, iOS (iPhones and iPads), and Android devices. The layout should automatically adapt to different screen sizes and orientations.

Add a toggle button in the header that allows users to switch between a light and dark theme for the entire web application.
## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e7097290-e9ea-4ffc-8bfb-cf6b02e1f1c9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e7097290-e9ea-4ffc-8bfb-cf6b02e1f1c9) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
