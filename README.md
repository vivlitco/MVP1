# Vivlit - Light Up Moments That Matter ✨

Vivlit is a modern web application for creating and sharing personalized jars of notes. Express emotions and celebrate memories through customizable digital gifting experiences.

**Website**: https://vivlit.com

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, clone the repo and start developing locally.

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

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Vivlit is configured to deploy on Render.com with the custom domain vivlit.com.

### Deployment Steps:

1. Connect your GitHub repository to Render
2. Create a new Web Service and select this repository
3. Configure environment variables (see .env.example)
4. Set build command: `npm run build`
5. Set start command: `npm run preview` or configure for production
6. Connect your vivlit.com domain in Render dashboard

### Custom Domain Setup:

1. In Render dashboard, go to your service settings
2. Navigate to "Custom Domains" section
3. Add your domain: `vivlit.com`
4. Update your domain DNS records with Render's nameservers
5. Verify domain ownership

For more details, see the deployment configuration in your environment variables.
