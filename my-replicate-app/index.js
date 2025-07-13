import Replicate from 'replicate'
import dotenv from 'dotenv'
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})
const model = 'bxclib2/flux_img2img:0ce45202d83c6bd379dfe58f4c0c41e6cadf93ebbd9d938cc63cc0f2fcb729a5'
const input = {
  seed: 0,
  image: 'https://replicate.delivery/pbxt/LNejsmEhVDfW7iRdapoqzUhIyctYDkubGPAJKSruGY3XokjO/1.png',
  steps: 20,
  denoising: 0.75,
  scheduler: 'simple',
  sampler_name: 'euler',
  positive_prompt: 'anime style',
}

console.log('Using model: %s', model)
console.log('With input: %O', input)

console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!', output)
