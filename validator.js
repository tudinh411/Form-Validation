function Validator(options){
    
    var selectorRules = {};

    // Validate the input
    function validate(inputElement, rule){
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;

        // Get all rules of a certain selector
        var rules = selectorRules[rule.selector];

        // Go through each rule and check
        // If there is an error message, stop checking
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }
                    
        if (errorMessage){
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }   
        
        return !errorMessage;
    }

    // Extract the element of the form that needs to be validated

    var formElement = document.querySelector(options.form);

    if (formElement){

        // When the form is submitted
        formElement.onSubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Go through each rule and validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

        
            if (isFormValid) {
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');

                    // Convert to an array
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        
                        return (values[input.name] = input.value) && values;
                    }, {});

                    console.log(formValues);
                    
                    options.onSubmit(formValues);
                }
                
            } 
        }

        // Listen to the events
        options.rules.forEach(function(rule){

            // Store all the rules for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement){
                // Handle when users blur out the input sections
                inputElement.onblur = function (){
                    validate(inputElement,rule);
                }

                //  Handle when users are typing in the input sections
                inputElement.oninput = function (){
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })
    }
}

Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : 'You must enter this field';
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'You must enter this field';
        }
    };
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Your password must have at least ${min} characters`;
        }
    };
}

Validator.isConfirmed = function(selector,getConfirmedValue, message) {
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmedValue() ? undefined : message || 'The value entered is not matched';
        }
    }
}
