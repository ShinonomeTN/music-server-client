export default {
  namespaced: true,
  state: {
    show: false,
    title: '',
    content: '',
    showCloseButton: false,
    buttonType: 'sao-yes-no',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'YES',
    cancelText: 'NO',
    modalRef: null,
  },
  mutations: {
    setGlobalModalRef(state, ref) {
      state.modalRef = ref;
    },
  },
  actions: {
    showGlobalModal({ state }, { title, content, showCloseButton, buttonType, onConfirm, onCancel, confirmText, cancelText }) {
      state.title = title;
      state.content = content;
      state.showCloseButton = (showCloseButton === null ? false : showCloseButton);
      state.buttonType = buttonType || 'sao-yes';
      state.onConfirm = onConfirm || (() => {});
      state.onCancel = onCancel || (() => {});
      state.confirmText = confirmText || 'YES';
      state.cancelText = cancelText || 'NO';
      state.show = true;
    },
    hideGlobalModal({ state }) {
      state.onConform = () => {};
      state.onCancel = () => {};
      return state.modalRef.hideModalBody().then(() => {
        state.show = false;
      });
    },
  },
};
