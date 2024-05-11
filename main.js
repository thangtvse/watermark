const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const sharp = require('sharp');

program
  .requiredOption('-i, --input <path>')
  .requiredOption('-w, --watermark <path>')
  .requiredOption('-o, --output <path>')
  .requiredOption('-g, --gravity <string>')
  .requiredOption('-s, --scale <number>')

program.parse();
const options = program.opts();

fs.mkdirSync(options.output, { recursive: true });


const main = async () => {
  const { width: logoWidth, height: logoHeight } = await sharp(options.watermark).metadata();
  const logo = sharp(options.watermark)

  fs.readdirSync(options.input).forEach(async (file) => {
    const { width, height } = await sharp(options.input + '/' + file).metadata();

    const ratio = logoWidth / logoHeight
    const scaledLogoWidth = Math.round(Math.sqrt(width * height * options.scale * ratio))
    const scaledLogoHeight = Math.round(scaledLogoWidth / ratio)

    const basename = path.parse(file).name

    const logoBuffer = await logo
      .resize(scaledLogoWidth, scaledLogoHeight, {
        fit: sharp.fit.inside
      })
      .toBuffer()

    sharp(options.input + '/' + file)
      .keepMetadata()
      .composite([
        {
          input: logoBuffer,
          gravity: options.gravity
        }
      ])
      .webp({ lossless: true })
      .toFile(options.output + '/' + basename + '.webp')
  });
}


main();