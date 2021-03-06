# Raven-Cli Beta
The Raven Framework command line utility makes it easy to get started building GBA ROMs.

Use the `raven --help` command for a description of all raven cli commands.

Note that this project is still under construction.

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
This command will generate your project folder with the necessary files to get started. The resulting project folder structure will look as follows:
```
|-- raven.json
`-- src
   `-- sample.c
```
The `raven.json` file will contain your project's configuration, while the `sample.c` file will contain the primary entry-point to your game.

## Developing your game
Start by modifying the generated source file. The libgba library (https://github.com/devkitPro/libgba) is automatically linked to your project. Option to link other libraries is planned for the future.

## Building your project
```
$ raven build
```
Running the build command will generate the `build` folder. In this folder, you will find your build rom (`build/<project_name>_mb.gba`). You can ignore the other files in that folder, as they are just required and generated files used to build the final `.gba` ROM.

Note that raven expects the `.c` file with the `main` entry-point to the game to be named the same as the project (the same as the `name` field in `raven.json`).

## Cleaning your project
```
$ raven clean
```
Run this command to clean your project folder of non-essential files. This command will delete your build folder.

## Source control
We suggest that you ignore the `build` folder when submitting your changes to a source control service.

## Contributing to Raven-Cli
TODO: Document the contribution process

## License
TODO: Add license agreements (probably GPL)

Libraries and tools in `/tools/ARM` come from the devkitPro project (http://devkitpro.org/).
