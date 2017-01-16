# Raven-Cli
The Raven Framework command line utility makes it easy to get started building GBA ROMs.

Use the `raven --help` command for a description of all raven cli commands.

## Supported platforms
The current build of raven cli has only been tested and confirmed working on MacOSX. Linux and Windows support is planned:
Linux: https://github.com/ravenframework/raven-cli/issues/25
Windows: https://github.com/ravenframework/raven-cli/issues/26

## Installing
```
$ npm install -g raven-cli
```

## Starting a raven project
```
$ raven start
```
This command will generate your project folder with the necessary files to get started.

## Building your project
```
$ raven build
```
Running the build command will generate the `build` folder. In this folder, you will find your build rom (`build/<project_name>_mb.gba`). You can ignore the other files in that folder, as they are just required and generated files used to build the final `.gba` ROM.

## Cleaning your project
```
$ raven clean
```
Run this command to clean your project folder of non-essential files. This command will delete your build folder.

## Source control
We suggest that you ignore the `build` folder when submitting your changes to a source control service.

## Contributing to Raven-Cli
TODO: Document the contribution process
