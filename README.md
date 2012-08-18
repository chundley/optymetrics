# Optymetrics

Internal business metrics dashboard.

## Project Structure
    /bin                    - Scripts used to start, stop, or otherwise manage the application
    /config                 - Application configuration files
    /data_access            - Methods for accessing external data sources
        /model              - Mongoose model/schema definitions. All files follow the convention <type>-model.js
    /jobs                   - Scheduled background jobs. All files follow the convetion <job_name>-job.js
    /util                   - General purpose utility libraries
    /web                    - Dynamic web content. Express.js and REST API endpoint definitions
    /public                 - Static web content
        /js         
            /ext            - Third party javascript libraries
            /controls       - General purpose UI controls.
            /<component>    - A subfolder per high-level section of the web application
                /views      - Backbone.js views. Files follow the convention <name>-view.js
                /models     - Backbone.js models. Files follow the convetion <name>-model.js
        /css                - Stylesheets. Stylesheet names should align with the name of the view they're associated with
        
## Naming Conventions

### File names
Javascript files are lower case with terms separated by a dash.
    
    velocity-table-view.js
    
### General Javascript conventions

Classes (views/models) are SentenceCase

    // Classes:
    Photo
    Album
    Author

Instance variables and functions are camelCase

    // Instances:
    photo
    myAlbum
    // Classes often start in uppercase letters, while instances start with lowercase letters. 
    // This is a throwback of the general Python and Ruby practice of having constant names start with uppercase letters.

Namespace are SentenceCase. The top-level application namespace is Opty

    window.Opty = {
    
    };

The convention we use puts everything in one App namespace to keep things organized properly.

    Opty.VelocityModel = Backbone.Model.extend({
    ...
    };
    
## UI patterns

The router OptyMetricsRouter manages top-level navigation, deep-linking, and view rendering. 
Each route is associated with its own view. This view is tasked with rendering out the DOM structure for
the view using Twitter bootstrap convetions for grid layout. This view creates and associates models for its
sub views, and defines where in the DOM the sub-views will be associated.

    // Route
    #/engineering/sprint-metrics
    
    // View
    SprintMetricsView
    
Sub-views a responsible for rendering a single component/widget/etc associated with data in a Backbone model or collection.

    // View 
    SprintMetricsView
    
    // Model
    VelocityMetricsCollection
    
    // Sub-views
    VelocityTableView
    VelocityChartView
    


    
    