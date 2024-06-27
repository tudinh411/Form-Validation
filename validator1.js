function Validator(formSelector, options) {

    if(!options) {
        options = {};
    }

    function getParent(element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }

            element = element.parentElement;
        }
    }

    var formRules = {};

    /**
     * if there is an error, return the error message
     * otherwise, return 'undefined'
     */
    var validatorRules = {
        required : function (value) {
            return value ? undefined : "Please enter this field";
        },
        email : function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'You must enter an email';
        },
        min : function(min){
            return function (value) {
                return value.length >= min ? undefined : `Your password must have at least ${min} characters`;
            }
        }
    };

    var formElement = document.querySelector(formSelector);
    

    if (formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs){

            var rules = input.getAttribute('rules').split('|');
            

            for (var rule of rules){
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');

                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
        

                
            }

            // Listen to events to validate
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        
            
        }
        // Validating function
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) {
                    break;
                }
            }
            

            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');

                if (formGroup) {

                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');

                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            return !errorMessage;
        }

        // Function to clear the error message when users typing

        function handleClearError(event) {

            var formGroup = getParent(event.target, '.form-group');

            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
            }

            var formMessage = formGroup.querySelector('.form-message');

                if (formMessage) {
                    formMessage.innerText = '';
                }
        }
        
    }

    // Handle submission
    formElement.onsubmit = function (event) {
        event.preventDefault();

        var isValid = true

        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            if ( !handleValidate({target:input}) ){
                isValid = false;
            }
        }

        if (isValid) {

            if (typeof options.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                values[input.name] = '';
                                return values;
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});
                options.onSubmit(formValues);

            }
            // Trường hợp submit với hành vi mặc định
            else {
                formElement.submit();
            }
        }
    }
    
    
}
