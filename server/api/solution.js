const router = require('express').Router()
const puppeteer = require('puppeteer')
const path = require('path')
const {getProblemById} = require('../db/queryFunctions/problemQueryFunctions')

module.exports = router

// Hard coded test. Tests will be stored in the DB and retieved when needed.
// const testConstructor = () => {
//   return test => {
//     console.log('>>> ', this)
//     let el = document.getElementById('code-box')
//     el.innerHTML += eval(test) + ' '
//   }
// }

const superTest = () => {
  console.log('>>> ', this)
  let el = document.getElementById('code-box')
  el.innerHTML += 'somthing' + ' '
}

const testString =
  "() => {let el = document.getElementById('code-box');el.innerHTML += (doSomething(1) === 2) + ' ';el.innerHTML += (doSomething(2) === 3) + ' '}"

// const test = () => {
//     let el = document.getElementById('code-box')
//     el.innerHTML += (doSomething(1) === 2) + ' '
//     el.innerHTML += (doSomething(2) === 3) + ' '
// }

const test = () => {
  let el = document.getElementById('code-box')
  el.innerHTML += this
}
// Function used to timeout async functions. Protects against infinite loops and stuff.
function promiseTimeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    // create a timeout to reject promise if not resolved
    var timer = setTimeout(function() {
      reject(new Error('promise timeout'))
    }, ms)

    promise
      .then(function(res) {
        clearTimeout(timer)
        resolve(res)
      })
      .catch(function(err) {
        clearTimeout(timer)
        reject(err)
      })
  })
}

// Function opens up a instance of Chrome, inserts the user's code via a script tag, evaluates the code against the tests, and returns the html document as a string.
async function ssr(url, userCode, userProblemTests) {
  const testArr = userProblemTests.split(', ')
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(url, {waitUntil: 'networkidle0'})
  await page.addScriptTag({content: `${userCode}`})
  testArr.forEach(async test => {
    await page.evaluate(superTest(test))
  })
  // await page.evaluate(test)
  const html = await page.content()
  await browser.close()
  return html
}

// Post requests will eventually have an id parameter which will be used to query tests from the database
router.post('/:id', async (req, res, next) => {
  try {
    const code = req.body.code
    const problemId = req.params.id
    const userProblem = await getProblemById(problemId)
    let testResult = await promiseTimeout(
      7000,
      ssr(
        `file:${path.join(__dirname, 'testingEnviroment.html')}`,
        code,
        userProblem.tests
      )
        .then(result => {
          console.log('HTML ', result)
          result = result.match(/\B>.*?<\/div/)[0]
          result = result.slice(1, result.length - 5)
          return result
        })
        .catch(err => console.log(err))
    )
    res.send(testResult)
  } catch (error) {
    res.send('Your solution timed out.')
    next(error)
  }
})
