// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

function screenButton(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

function field(id: string): HTMLInputElement {
  return document.getElementById(`${id}-input`) as HTMLInputElement
}

function displayValue(): string {
  const el = document.querySelector('.display-value') as HTMLElement | null
  return el ? el.textContent ?? '' : ''
}

function displayExpr(): string {
  const el = document.querySelector('.display-expr') as HTMLElement | null
  return el ? el.textContent ?? '' : ''
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('imperial feet/inches input', () => {
  it('calculates feet and a plain-inch value', () => {
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    expect(displayValue()).toBe(`5' 0"`)
    fireEvent.change(field('inch'), { target: { value: '6' } })
    expect(displayValue()).toBe(`5' 6"`)
  })

  it('keeps a typed fraction in the inch field and calculates it', () => {
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    fireEvent.change(field('inch'), { target: { value: '6 1/2' } })
    expect(field('inch').value).toBe('6 1/2')
    expect(displayValue()).toBe(`5' 6 1/2"`)
  })

  it('does not clear inputs while typing a fraction step by step', () => {
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    fireEvent.change(field('inch'), { target: { value: '6' } })
    expect(displayValue()).toBe(`5' 6"`)
    fireEvent.change(field('inch'), { target: { value: '6 1' } })
    expect(displayValue()).toBe(`5' 6"`)
    fireEvent.change(field('inch'), { target: { value: '6 1/' } })
    expect(displayValue()).toBe(`5' 6"`)
    fireEvent.change(field('inch'), { target: { value: '6 1/2' } })
    expect(displayValue()).toBe(`5' 6 1/2"`)
  })

  it('applies a fraction picked from the dropdown', () => {
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    fireEvent.change(field('inch'), { target: { value: '6' } })
    fireEvent.change(field('frac'), { target: { value: '1/4' } })
    expect(displayValue()).toBe(`5' 6 1/4"`)
  })

  it('adds two imperial values with the keypad', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.focus(field('feet'))
    await user.click(screenButton('5'))
    expect(field('feet').value).toBe('5')
    expect(displayValue()).toBe(`5' 0"`)
    await user.click(screenButton('+'))
    fireEvent.focus(field('feet'))
    await user.click(screenButton('2'))
    expect(field('feet').value).toBe('2')
    expect(displayValue()).toBe(`2' 0"`)
    await user.click(screenButton('='))
    expect(displayExpr()).toBe(`5' 0" + 2' 0" = 84`)
    expect(displayValue()).toBe('84')
  })

  it('types feet then inches with the keypad and backspaces', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.focus(field('feet'))
    await user.click(screenButton('1'))
    await user.click(screenButton('2'))
    expect(field('feet').value).toBe('12')
    expect(displayValue()).toBe(`12' 0"`)
    fireEvent.focus(field('inch'))
    await user.click(screenButton('6'))
    await user.click(screenButton('7'))
    expect(field('inch').value).toBe('67')
    expect(displayValue()).toBe(`12' 67"`)
    await user.click(screenButton('Backspace'))
    expect(field('inch').value).toBe('6')
    expect(displayValue()).toBe(`12' 6"`)
  })

  it('picks a fraction from the dropdown', () => {
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    fireEvent.change(field('inch'), { target: { value: '6' } })
    fireEvent.change(field('frac'), { target: { value: '1/2' } })
    expect(displayValue()).toBe(`5' 6 1/2"`)
  })

  it('enters a metric value', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Metric' }))
    fireEvent.change(field('meter'), { target: { value: '2' } })
    expect(displayValue()).toBe('2 m 0 cm')
    fireEvent.change(field('cm'), { target: { value: '50' } })
    expect(displayValue()).toBe('2 m 50 cm')
  })

  it('multiplies a measurement by a plain number', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '5' } })
    fireEvent.change(field('inch'), { target: { value: '6' } })
    await user.click(screenButton('×'))
    expect(field('number')).toBeTruthy()
    fireEvent.change(field('number'), { target: { value: '3' } })
    expect(displayValue()).toBe('3')
    await user.click(screenButton('='))
    expect(displayExpr()).toBe(`5' 6" × 3 = 198`)
    expect(displayValue()).toBe('198')
    expect(field('feet').value).toBe('16')
    expect(field('inch').value).toBe('6')
  })

  it('divides a measurement by a plain number', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.change(field('feet'), { target: { value: '10' } })
    await user.click(screenButton('÷'))
    expect(field('number')).toBeTruthy()
    fireEvent.change(field('number'), { target: { value: '4' } })
    await user.click(screenButton('='))
    expect(displayExpr()).toBe(`10' 0" ÷ 4 = 30`)
    expect(displayValue()).toBe('30')
    expect(field('feet').value).toBe('2')
    expect(field('inch').value).toBe('6')
  })

  it('multiplies a metric measurement by a plain number', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Metric' }))
    fireEvent.change(field('meter'), { target: { value: '2' } })
    await user.click(screenButton('×'))
    fireEvent.change(field('number'), { target: { value: '3' } })
    await user.click(screenButton('='))
    expect(displayExpr()).toBe(`2 m 0 cm × 3 = 6000`)
    expect(displayValue()).toBe('6000')
    expect(field('meter').value).toBe('6')
  })
})
