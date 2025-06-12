'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Comment',
  message = 'Are you sure you want to delete this comment? This action cannot be undone.',
}: ConfirmDialogProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-sm w-full shadow-lg z-50">
            <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-white">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              {message}
            </Dialog.Description>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
