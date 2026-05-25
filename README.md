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

Vivlit is configured for production deployment on Vercel with the custom domain vivlit.com.

### Deployment Steps:

1. Connect your GitHub repository to Vercel
2. Import the project as a new Vercel app
3. Configure the required environment variables in Vercel Project Settings
4. Keep the build command as `npm run build`
5. Set the output directory to `dist`
6. Add your vivlit.com domain in the Vercel dashboard

### Custom Domain Setup:

1. In Vercel dashboard, open your project settings
2. Navigate to the "Domains" section
3. Add your domain: `vivlit.com`
4. Update your domain DNS records as instructed by Vercel
5. Verify domain ownership

For more details, see the Vercel deployment configuration and environment variables.
