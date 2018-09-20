## Dockerhub

Docker container location: https://hub.docker.com/r/artsdatabanken/tiny-tileserver/

## Sample URL

- http://localhost:8000/AO_18/3/4/6

## Docker

Navigate to folder containing mbtiles and run

```
docker run -v ${pwd}:/data -p 8000:8000 artsdatabanken/tiny-tileserver
```
