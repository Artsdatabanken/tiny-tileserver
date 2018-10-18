# tiny-tileserver

[![Build Status](https://travis-ci.org/Artsdatabanken/tiny-tileserver.svg?branch=master)](https://travis-ci.org/Artsdatabanken/tiny-tileserver)
[![Coverage Status](https://coveralls.io/repos/github/Artsdatabanken/tiny-tileserver/badge.svg?branch=master)](https://coveralls.io/github/Artsdatabanken/tiny-tileserver?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/Artsdatabanken/tiny-tileserver.svg)](https://greenkeeper.io/)
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

[![Screenshot](doc/screenshot.png "ratatouille screenshot")](https://maps.artsdatabanken.no)

Demo: [tiny-tileserver](https://maps.artsdatabanken.no)

tiny-tileserver is a minimal raster and vector tile server. It only supports .mbtiles containing rasters of .png, .jpg and vector tiles in .pbf protobuf format. Vector tiles needs to be stored gzip compressed in the .mbtiles file.

## Features

- Supports thousands of tile sets
- Vector tiles (MBTiles)
  - Serve protobuf .pbf vector tiles
  - Compressed (deflate, gzip) or uncompressed tiles
  - Can convert to .geosjon
  - Return semi-raw protobuf as json (integer coordinates)
- Raster tiles (MBTiles)
  - Serve png or jpg raster tiles
- Static files
  - Can serve any other file statically

## Installation

Put one or more .mbtiles inside the data subfolder.

Execute:

yarn
yarn start

Navigate to http://localhost:8000/ to display a summary of the tile sets.

Tiles can be pulled using an url of this form: http://localhost:8000/{name}/{zoom}/{x}/{y}

## Configuration

Tiny-tileserver has command-line options:

```
Usage: node tiny-tileserver.js [options] [rootDirectory]

rootDirectory    Data directory containing .mbtiles

Options:
   -p PORT --port PORT       Set the HTTP port [8000]

A root directory is required.
```

## Images

The following images are built for each tiny-tileserver release, using the Node.js base image.

- Latest: https://hub.docker.com/r/artsdatabanken/tiny-tileserver/

### Docker image ##

To use prebuilt docker image, navigate to a folder containing .mbtile file(s) and run

```
docker run -v ${pwd}:/data -p 8000:8000 artsdatabanken/tiny-tileserver
```
