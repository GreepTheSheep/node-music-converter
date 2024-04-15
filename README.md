# Music Converter

## Converts music from FLAC, MP3, WAV, WMA, OGG to MP3

### Why ?

Because I have a folder of more than 3k music files in FLAC format that I need to convert to MP3 to be played into GTA games in the User Tracks folder.

All GTA games only accepts MP3 formats for their User Tracks.

### How to use it ?

The simplest way is to use the Docker Container shipped.

You can run it in a simple `docker run` command, or with the [docker compose file](docker-compose.yml).

```
docker run --rm --name music-converter -v ./music-flac:/source -v ./music-mp3:/dest ghcr.io/greepthesheep/node-music-converter/music-converter
```

(The `--rm` argument will automatically delete the container when the task is finished)

You can use it in cron tasks also.

*Another way is to use Node.js and use it from source.*

### Environment variables

| Variable               | Description                                                                                    | Defaults  |
|------------------------|------------------------------------------------------------------------------------------------|-----------|
| `SOURCE_DIR`           | The source directory, where all your music files are located at                                | `/source` |
| `DEST_DIR`             | The destination directory, where all your files are converted                                  | `/dest`   |
| `DELETE_DEST_ON_START` | If true, deletes and recreates the `DEST_DIR`                                                  | `false`   |
| `IGNORE_EXISTS`        | If true, ignore if file is already converted. Else delete the converted file and reconverts it | `true`    |
| `MP3_BITRATE`          | The MP3 bitrate in kpbs                                                                        | `256`     |