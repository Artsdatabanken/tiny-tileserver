# tiny-tileserver

tiny-tileserver is a minimal raster and vector tile server. It only supports .mbtiles containing rasters of .png, .jpg and vector tiles in .pbf protobuf format. Vector tiles needs to be stored gzip compressed in the .mbtiles file.

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

- **latest** - uses [mhart/alpine-node](https://hub.docker.com/r/mhart/alpine-node/).

Node-RED releases are also tagged with a version label, allowing you to fix on a specific version: `latest:X.Y.Z`,
`slim:X.Y.Z`, `rpi:X.Y.Z`.

You can see a full list of the tagged releases [here](https://hub.docker.com/r/artsdatabanken/tiny-tileserver/tags/).

### Docker image

To use prebuilt docker image, navigate to a folder containing .mbtile file(s) and run

```
docker run -v ${pwd}:/data -p 8000:8000 artsdatabanken/tiny-tileserver
```
