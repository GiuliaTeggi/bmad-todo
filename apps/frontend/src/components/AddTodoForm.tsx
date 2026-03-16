import { useRef, useState, type FormEvent } from "react"
import { useCreateTodo } from "../hooks/useCreateTodo"

interface AddTodoFormProps {
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function AddTodoForm({ inputRef: externalRef }: AddTodoFormProps) {
  const [text, setText] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef ?? internalRef
  const mutation = useCreateTodo()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setValidationError("Please enter a todo item.")
      inputRef.current?.focus()
      return
    }
    setValidationError(null)

    mutation.mutate(trimmed, {
      onSuccess: () => {
        setText("")
        inputRef.current?.focus()
      }
    })
  }

  return (
    <form
      className='add-todo-form'
      onSubmit={handleSubmit}
      noValidate
      aria-label='Add a new todo'
    >
      <div className='add-todo-form__field'>
        <label htmlFor='new-todo-input' className='visually-hidden'>
          New todo
        </label>
        <input
          id='new-todo-input'
          ref={inputRef}
          type='text'
          className={`add-todo-form__input${validationError ? " add-todo-form__input--error" : ""}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (validationError) setValidationError(null)
          }}
          placeholder='What needs to be done?'
          aria-required='true'
          aria-describedby={validationError ? "new-todo-error" : undefined}
          aria-invalid={validationError ? "true" : undefined}
          autoComplete='off'
        />
        {validationError && (
          <span
            id='new-todo-error'
            role='alert'
            className='add-todo-form__error'
          >
            {validationError}
          </span>
        )}
      </div>
      <button
        type='submit'
        className='add-todo-form__button'
        aria-label='Add todo'
        disabled={mutation.isPending}
      >
        Add
      </button>
    </form>
  )
}
