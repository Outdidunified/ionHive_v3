import Swal from 'sweetalert2';

export const showSuccessAlert = (title = 'Success', text = '') => {
  return Swal.fire({ title, text, icon: 'success' });
};

export const showErrorAlert = (title = 'Error', text = 'Something went wrong!') => {
  return Swal.fire({ title, text, icon: 'error' });
};

export const showWarningAlert = (title = 'Warning', text = '', timer = 2000) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    timer,
    timerProgressBar: true,
  });
};

export const showConfirmationAlert = ({
  title = 'Are you sure?',
  text = 'You won’t be able to revert this!',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  icon = 'warning',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText,
    cancelButtonText,
  });
};

export const showRemovalConfirmation = (text = 'Do you really want to remove this item?') => {
  return Swal.fire({
    title: 'Are you sure?',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'No, keep it'
  });
};

export const showRemovedAlert = (title = 'The item has been removed.') => {
  return Swal.fire({ title, icon: 'success' });
};
