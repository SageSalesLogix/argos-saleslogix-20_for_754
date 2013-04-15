argos-saleslogix-20_for_754
===========================

Compatibility module for running the Sage SalesLogix Mobile 2.0 and 2.1 client with the SalesLogix 7.5.4 platform.

##To Develop

1. Clone the git repo or use the Downloads page to get a zip file
1. Unzip (or move clone) to your `mobile/products/` folder. The same level as `argos-saleslogix`
1. Copy `index-dev-20_for_754.html` and paste a copy into `argos-saleslogix` run the index file from within `argos-saleslogix`


##To Deploy

1. Build this module
1. Copy this modules deploy folder contents to your main deploy folder
1. Edit your main deploy folder `index` files to:
   * add a script reference to `content/javascript/argos-backcompat_20_for_754.js`
   * require the `configuration/backcompat` with the main app config

###Building this Module

1.	Save this [gist](https://gist.github.com/815451) as `build-module.cmd` to the directory where you cloned [Argos SDK][argos-sdk] (The same folder where you created the Products folder).

1.	Open a command prompt and execute the following, changing paths as appropriate, eg:

   ```
cd \mobile
build-module sample
   ```

1.	The deployed module will be in a `deploy` folder in the directory where you cloned [argos-saleslogix-20_for_754][argos-saleslogix-20_for_754].

###Copy Deploy Contents

Open `mobile/products/argos-saleslogix-20_for_754/deploy`, copy all folders (configuration, content) to your main deploy folder `mobile/deploy/argos-saleslogix`. Click yes to merge folders.

###Edit Index Files

Edit `index.html`, `index-nocache.html`, `index.aspx` and `index-nocache.aspx` to include the script reference:

From:
```html
    <!-- Modules -->
    <!--{{modules}}-->
```

To:
```html
<!-- Modules -->
<!-- BackCompat 754 -->
<script type="text/javascript" src="content/javascript/argos-backcompat_20_for_754.js"></script>
```

Lastly we need to add the modules configuration by editing the following lines:

```javascript
    (function() {
        var application = 'Mobile/SalesLogix/Application',
            configuration = [
                'configuration/production'
           ];
```

To:

```javascript
    (function() {
        var application = 'Mobile/SalesLogix/Application',
            configuration = [
                'configuration/production',
                'configuration/backcompat/production'
           ];
```

#### Finished

The argos-saleslogix-20_for_754 module will now be part of the Sage SalesLogix Mobile client.


[argos-sdk]: https://github.com/Sage/argos-sdk "Argos SDK Source"
[argos-saleslogix]: https://github.com/SageSalesLogix/argos-saleslogix "Argos SalesLogix Source"
[argos-saleslogix-20_for_754]: https://github.com/SageSalesLogix/argos-saleslogix-20_for_754 "Argos SalesLogix BackCompat 754"
