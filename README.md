## Running Locally
This site uses Jekyll to eliminate the need to manually update each page when the layout or header is changed. This is done natively on the github pages page, but running locally on your machine requires the following steps:

1. Install Ruby and Bundler (if not already installed)
2. Install dependencies: `bundle install`
3. Start the local server: `bundle exec jekyll serve`
4. Open your browser to `http://localhost:4000`

## Structure

```
/
├── index.html          # Main homepage with demo grid
├── css/
│   └── main.css        # Styles for the homepage
├── demos/              # Directory containing all demos
│   ├── example-demo/   # Example demo template
│   │   ├── index.html  # Demo page
│   │   ├── style.css   # Demo styles
│   │   └── script.js   # Demo functionality
│   └── [your-demo]/    # Add new demos here
└── README.md
```

## Adding a New Demo

### Step 1: Create Demo Directory

Create a new folder in the `demos/` directory:

### Step 2: Create Demo Files

Put your demo in the new folder, either as a single html file or separated into html, css and js if preferred.


#### Key Points

- Keep the demo self-contained within its directory
- Use relative paths for assets

### Step 3: Add Demo Card to Demonstrations Page

Edit `demonstrations.html` and add a new demo card to the grid:

```html
<a href="demos/your-demo-name/" class="demo-card">
    <div class="demo-card-content">
        <h2>Your Demo Title</h2>
        <p>Brief description of what your demo demonstrates.</p>
        <div class="demo-tags">
            <span class="tag">HTML</span>
            <span class="tag">CSS</span>
            <span class="tag">JavaScript</span>
        </div>
    </div>
</a>
```

Add this inside the `<main class="demo-grid">` section, before the placeholder card.



