class DomEl { 
    constructor(creationString) {
        this.elType = creationString.match(/^(\w+)*/g);
        this.classes = creationString.match(/\.(?![^[]*])([^\s\.\#\[]*)/g);
        this.id = creationString.match(/\#([^\s\.\[]*)/g);
        this.attributes = creationString.match(/\[([^\]]*)/g);
        if (this.elType) {
            this.el = document.createElement(this.elType);
            if (this.classes && this.classes.length > 0) {
                for (var className of this.classes) {
                    this.el.classList.add(className.replace('.',''));
                }
            }
            if (this.attributes && this.attributes.length > 0) {
                for (var attributeString of this.attributes) {
                    let attribute = attributeString.split('=');
                    if (attribute.length == 1) {
                        attribute.push('');
                    } else {
                        attribute[1] = attribute[1].replace(/"/g,'');
                    }
                    attribute[0] = attribute[0].replace('[','');
                    if (['title','href'].indexOf(attribute[0]) > -1) {
                        this.el[attribute[0]] = attribute[1];
                    }
                    this.el.setAttribute(attribute[0],attribute[1]);
                }
            }
            if (this.id && this.id.length == 1) {
                this.el.id = this.id[0].replace('#','');
            }
            return this.el;
        }   
    }
}

class DomButton { 
    constructor(title, icon, btnClass, text) {
        let btn = (btnClass) ? 'button.' + btnClass.split(' ').join('.') : 'button';
        let buttonEl = new DomEl(btn + '[title="' + title + '"]');
        if (icon) {
            buttonEl.append(new DomEl('i.fas.fa-' + icon));
        }
        if (text) {
            let span = new DomEl('span');
            span.innerText = text;
            buttonEl.append(span);
        }
        return buttonEl
    }
}

class MiniModal {
    constructor(content, childClass=false) {
        this.confirmed = false;
        if (!childClass) {
            return this.constructModal(content);
        }
    }

    addClickHandlers() {
        let modal = this;
        if (this.options.closeOnBackgroundClick) {
            this.backgroundDiv.addEventListener('click', function(e) {
                e.preventDefault();
                modal.close();
            });
        }
        this.modalContainer.addEventListener('keydown', function(e) {
            let option = this.options;
            if (e.keyCode == 13) {
                e.preventDefault();
                if (modal.options.enterConfirms) {
                    modal.confirm();
                }
            }
        });
    }

    addCloseX() {
        this.closeBtn = new DomButton('Close modal', 'times-circle', 'closeBtn');
        this.header.append(this.closeBtn);
        let modal = this;
        this.closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.close();
        });
    }

    addConfirmButton() {
        let modal = this;
        if (!this.buttonBar) {
            this.buttonBar = new DomEl('div.modal-buttons');
        }
        this.confirmBtn = new DomButton(this.options.confirmButtonTitle, false, this.options.confirmButtonClass, this.options.confirmButtonText);
        this.buttonBar.append(this.confirmBtn);
        this.modalContainer.append(this.buttonBar);
        if (this.options.confirm) {
            this.cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                modal.close();        
            });
        }
        this.confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.confirm();
        });
    }

    addKeyboardHandlers() {
        let modal = this;
        this.modalContainer.addEventListener('keydown', function(e) {
            if (e.which == 27) {
                e.preventDefault();
                e.stopPropagation();
                modal.close();
            }
        });
    }

    buildOptions(content) {
        this.getDefaultOptions();
        if (typeof(content) == 'string') {
            this.options.content = content;
        } else {
            for (let [key,value] of Object.entries(content)) {
                this.options[key] = value;
            }
        }
    }

    buildModal() {
        if (this.options.modalClass) {
            if (typeof(this.options.modalClass) == 'string') {
                this.options.modalClass = [this.options.modalClass];
            }
            this.options.modalClass.forEach(function(className) {
                this.backgroundDiv.classList.add(className);
                this.modalContainer.classList.add(className);
            });
        }
        this.header = new DomEl('div.modal-header');
        if (this.options.header) {
            let h2 = new DomEl('h2');
            h2.text = this.options.header;
            this.header.append(h2);
        }
        if (this.options.closeX) {
            this.addCloseX();
        }
        this.modalContainer.append(this.header);
        this.modalContent = new DomEl('div.modal-content[tab-index=0]');
        if (this.options.notificationText) {
            this.notification.innerText = this.options.notificationText;
        }
        if (this.options.contentType == 'text') {
            this.modalContent.innerText = this.options.content;
            if (!this.options.notificationText) {
                this.notification.innerText = this.options.content;
            }
        } else if (this.options.contentType == 'node') {
            this.modalContent.append(this.options.content);
        } else {
            this.modalContent.innerHTML = this.options.content;
        }
        if (this.options.notificationTarget) {
            this.modalContainer.setAttribute('aria-describedby', this.options.notificationTarget);
        }
        this.modalContainer.append(this.modalContent);
        if (!this.options.noButtons) {
            this.buttonBar = new DomEl('div.modal-buttons');
            if (this.options.confirm) {
                this.cancelBtn = new DomButton(this.options.cancelButtonTitle, false, this.options.cancelButtonClass, this.options.cancelButtonText);
                this.buttonBar.append(this.cancelBtn);
            } else {
                this.buttonBar.style.textAlign = 'center';
            }
            this.addConfirmButton();
        }
    }

    buildBasicStructure() {
        let theTime = new Date().getMilliseconds();
        this.notification = new DomEl('label.sr-only[aria-live="alert"]#alertModalNotifier' + theTime);
        this.backgroundDiv = new DomEl('div.miniModal-background');
        this.modalContainer = new DomEl('div.miniModal-container[aria-modal="true"]');
    }

    close() {
        if (this.options.confirm && !this.confirmed) {
            this.modalContainer.dispatchEvent(new Event('canceled'));
        } else {
            this.modalContainer.dispatchEvent(new Event('closed'));
        }
        this.backgroundDiv.classList.remove('show');
        this.modalContainer.classList.remove('show');
        let modal = this;
        setTimeout(function() {
            modal.backgroundDiv.remove();
            modal.modalContainer.remove();
        }, 750);
    }

    confirm() {
        if (this.options.confirm) {
            this.modalContainer.dispatchEvent(new Event('confirmed'));
            this.confirmed = true;
        }
        this.close();
    }

    constructModal(content) {
        this.buildBasicStructure();
        this.buildOptions(content);
        this.buildModal();
        this.addClickHandlers();
        this.addKeyboardHandlers();
        this.show();
        if (this.options.returnObject) {
            return this;
        } else {
            return this.modalContainer;
        }
    }

    getDefaultOptions() {
        this.options = {
            cancelButtonClass: 'btnCancel',
            cancelButtonText: 'Cancel',
            cancelButtonTitle: 'Cancel action',
            confirmButtonClass: 'btnConfirm',
            confirmButtonText: 'OK',
            confirmButtonTitle: 'Proceed with action',
            closeOnBackgroundClick: true,
            closeX: true,
            confirm: false,
            content: false,
            contentType: 'text',
            enterConfirms: true,
            focusTarget: false,
            header: false,
            modalClass: false,
            noButtons: false,
            notificationTarget: this.notification.id,
            notificationText: false,
            returnObject: false
        };
    }

    show() {
        document.body.append(this.backgroundDiv);
        document.body.append(this.modalContainer);
        this.backgroundDiv.classList.add('show');
        this.modalContainer.classList.add('show');
        let target = this.confirmBtn; 
        if (this.options.focusTarget) {
            if (typeof(this.options.focusTarget) == 'string') {
                target = this[this.options.focusTarget];
            } else {
                target = this.options.focusTarget;
            }   
        } else if (this.options.confirm) {
            target = this.cancelBtn;
        }
        setTimeout(function() {
            target.focus();
        },0);
    }
}

class ErrorModal extends MiniModal {
    constructor(errorMessage) {
        let errorDiv = new DomEl('div.error');
        errorDiv.append(new DomEl('i.fas.fa-exclamation-circle.fa-2x'));
        errorDiv.append(new DomEl('br'));
        errorDiv.append(new DomEl('p').innerText = errorMessage);
        super({
            closeX: false,
            confirmButtonClass: false,
            contentType: 'node',
            content: errorDiv,
            focusTarget: errorDiv,
            header: 'Error',
            notificationText: errorMessage
        });
    }
}

class Ajax {
    constructor(url, data, progressBar, method='POST', returnObj=false) {
        this.xhr = new XMLHttpRequest();
        let fd = false;
        if (data) {
            if (data.constructor && data.constructor.name && data.constructor.name == 'FormData') {
                // Don't mess with data passed as FormData
                fd = data;
            } else {
                fd = new FormData();
                for (let [key,value] of Object.entries(data)) {
                    if (typeof(value) == 'object') {
                        value = JSON.stringify(value);
                    }
                    fd.append(key, value);
                }
            }
        }
        var xhr = new XMLHttpRequest();
        if (progressBar) {
            xhr.upload.addEventListener('progress', function(e) {
                progressBar.update( Math.round( (e.loaded * 100) /e.total) );
            });
        }
        this.eventEl = new DomEl('div');
        xhr.responseType = 'json';
        xhr.open(method, url);
        xhr.send(fd);
        xhr.onerror = function() { new ErrorModal('An error occurred.'); };
        let ajax = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (xhr.response.type == 'error') {
                        new ErrorModal(xhr.response.content);
                        ajax.throwError(ajax.eventEl, progressBar);
                    } else {
                        for (let [key, value] of Object.entries(xhr.response)) {
                            ajax.response = xhr.response;
                            ajax.eventEl.setAttribute(key, value);
                        }
                        if (progressBar) {
                            progressBar.update(100);
                        }
                        ajax.eventEl.dispatchEvent(new Event('success'));
                    }
                } else if (xhr.status == 410 || xhr.status === 404 || xhr.status == 403 || xhr.status === 401 ) {
                    new ErrorModal(xhr.status + ', check your URL');
                    ajax.throwError(ajax.eventEl, progressBar);
                } else if (xhr.status === 431 || xhr.status === 413) {
                    new ErrorModal(xhr.status + ', check your server settings');
                    ajax.throwError(ajax.eventEl, progressBar);
                } else {
                    new ErrorModal('Networking returned a ' + xhr.status + ' error');
                    ajax.throwError(ajax.eventEl, progressBar);
                }
            }
        };
        if (returnObj) {
            return this;
        } else {
            return this.eventEl;
        }
    }

    throwError(eventEl, progressBar) {
        if (this.progressBar) {
            progressBar.update('failure');
        }
        eventEl.dispatchEvent(new Event('failure'));
    }
}

class ProgressBar {
    constructor(target, removeOnCompletion, type) {
        this.type = type || 'Upload';
        this.removeOnCompletion = removeOnCompletion;
        let notificationId = 'progress' + new Date().getMilliseconds();
        this.notification = new DomEl('div.sr-only[tab-index=0][aria-hidden=true][aria-live=assertive][aria-atomic=additions]#' + notificationId);
        this.notification.innerText = 'Press spacebar to get current value';
        this.track = new DomEl('div.progressBar[tab-index=1][role=progressbar][aria-describedby=' + notificationId + '][aria-valuenow=0]');
        let theBar = this;
        this.track.addEventListener('keydown', function(e) {
            if (e.keyCode == 32) {
                theBar.notify();
            }
        });
        this.bar = new DomEl('div.bar[tab-index=0]');
        this.track.append(this.bar);
        target.append(this.track);
        target.append(this.notification);
    }

    notify(num) {
        if (num == 'failure') {
            this.track.setAttribute('tab-index',0);
            this.notification.innerText = this.type + ' failed';
        } else if (num == 100) {
            this.track.setAttribute('tab-index',0);
            this.notification.innerText = this.type + ' Complete';
            if (this.removeOnCompletion) {
                let theBar = this;
                setTimeout(function() { 
                    theBar.track.remove();
                    theBar.notification.remove(); 
                }, 500);
            }
        } else {
            this.notification.innerText = num + '%';
        }
    }

    update(num) {
        this.bar.style.width = num + '%';
        if (num == 100) {
            this.bar.classList.add('done');
            this.notify(num);
        }
    }
}