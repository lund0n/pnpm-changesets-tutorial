import dedent from 'dedent'
import prettier from 'prettier'
import prettierConfig from '../src/index'

const config = {
  ...prettierConfig,
  parser: 'babel',
  printWidth: 30,
}

test('validate semicolon', () => {
  const source = `const foo = 'bar'\n`
  expect(prettier.format(source, config)).toEqual(source)
})

test('validate trailing commas in array', () => {
  const source = dedent`
    const foo = [
      'milk',
      'eggs',
      'butter',
      'Pepsi',
      'cinnamon bears',
    ]\n
  `
  expect(prettier.format(source, config)).toEqual(source)
})

test('validate function parameter commas', () => {
  const source = dedent`
    function foo(
      parameter1,
      parameter2,
      parameter3
    ) {}\n
  `

  expect(prettier.format(source, config)).toEqual(source)
})
