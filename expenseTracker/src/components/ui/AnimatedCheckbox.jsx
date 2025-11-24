import { useId } from 'react'

export default function AnimatedCheckbox({ id, checked, onChange }) {
  const autoId = useId()
  const inputId = id || `notify-${autoId}`

  return (
    <label className="cl-checkbox checkbox-wrapper" htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span />
    </label>
  )
}
