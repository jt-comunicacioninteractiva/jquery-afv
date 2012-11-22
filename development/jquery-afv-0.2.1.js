/**
 * jQuery - Ambar Forms Validator
 *
 * @author Javier Trejo @ JT - Comunicación Interactiva
 * @version 0.2.1
 * @see http://jt-comunicacioninteractiva.github.com/jquery-afv
 *
 * Este plugin se utiliza para validar formularios antes de ser enviados al
 * servidor.
 * Se inicia a si mismo por lo que no es necesario invocarlo y se vale de
 * los atributos data-afv-* y los atributos estandar de HTML para la
 * configuración.
 *
 */
(function($) {
	var errorsCollection;
	var defaultOptions 		= {
		// Espacio de nombres por default para los atributos data-*
		namespace 		: 'afv',
		
		// Expresiones regulares por default para la validación de formato
		expresions		: {
			email			: /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)$/,
			url				: /((http\:\/\/|https\:\/\/|ftp\:\/\/)|(www.))+(([a-zA-Z0-9\.-]+\.[a-zA-Z]{2,4})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(\/[a-zA-Z0-9%:\/-_\?\.'~]*)?/,
			string			: /^[a-zA-Z]+$/,
			number			: /^\s*\d+\s*$/,
			extendedString	: /^[-\sa-zA-Z0-9]+$/
		},
		
		// Mensajes de error por default para mostrar al usuario
		errorMessages	: {
			required		: "El campo es obligatorio",
			minLength		: "El campo debe tener {0} como mínimo",
			maxLength		: "El campo debe tener {0} como máximo",
			defaultOption	: "Debe seleccionar un valor",
			equalTo			: "Los campos {0} y {1} deben ser iguales",
			format			: "El valor ingresado no se corresponde con el formato requerido",
			minCheckbox		: "Se deben seleccionar al menos {0}"
		},
		
		// Indica la forma en que se muestran los mensajes de error
		errorDisplay		: "inside",
		
		// Clase CSS por default para los campos con error
		errorClass			: "afv-field-error"
	};

	var methods = {
		//Inicializa el validador para aquellos formularios que así lo requieren
		init 	: function(options) {
			$.extend(defaultOptions, options);
			
			$(document).ready(function(){
				$('[data-' + defaultOptions.namespace + '-validate=true]')
					.find('[data-' + defaultOptions.namespace + '-role=submit]')
					.bind('click', methods.submit);
			});
		},
		
		//Valida el formulario antes de realizar cualquier acción
		validate: function(form) {
			var isValid			= true;
			
			errorsCollection	= [];
			
			$("." + defaultOptions.errorClass).removeClass(defaultOptions.errorClass).removeAttr("title");
			
			// Controla la propiedad campo obligatorio
			form.find("[data-" + defaultOptions.namespace + "-required]").each(function(index, item){
				var item	= $(item);
				var type	= item.attr("type");
				
				if(type == undefined)
					type	= item[0].type;
				
				switch(type)
				{
					// Control específico para los campos tipo checkbox
					case "checkbox":
						if(!item.is(":checked"))
						{
							isValid	= false;
							errorsCollection.push({
								field	: item,
								message	: defaultOptions.errorMessages.required,
								error	: $.ambarFormsValidator.Validator.REQUIRED
							});	
						}
						break;
						
					// Control especifíco para fieldset que dentro contienen radio
					case "fieldset":
						var radios		= item.find('input[type="radio"]');
						var selected	= false;
						
						if(radios.length > 0)
						{
							radios.each(function(index, radio){
								var radio	= $(radio);
								
								if(radio.is(":checked"))
								{
									selected	= true;
									return;
								}
							});
							
							if(!selected)
							{
								isValid	= false;
								errorsCollection.push({
									field	: item,
									message	: defaultOptions.errorMessages.required,
									error	: $.ambarFormsValidator.Validator.REQUIRED
								});
							}
						}						
						else
						{
							console.error("AFV: El elemento no contiene radio buttons en su interior", item);
						}
						break;
						
					// Control específico para los campos cuyo tipo no esté especificado anteriormente (Ej.: text, password, etc.)
					default	:
						if(item.val().length == 0)
						{
							isValid	= false;
							errorsCollection.push({
								field	: item,
								message	: defaultOptions.errorMessages.required,
								error	: $.ambarFormsValidator.Validator.REQUIRED
							});	
						};
				}
			});
			
			//Controla la cantidad mínima de elementos marcados para un grupo de checkbox
			form.find("[data-" + defaultOptions.namespace +  "-check]").each(function(index, item){
				var item	= $(item);
				var target	= item.attr("data-" + defaultOptions.namespace +  "-check");
				var checked	= item.find('input[type="checkbox"]:checked').length;
				
				if(checked < target)
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.minCheckbox,
						error	: $.ambarFormsValidator.Validator.CHECKBOX_MIN
					});
				}
			})
			
			// Controla la propiedad cantidad mínima de caracteres de un campo
			form.find("[data-" + defaultOptions.namespace + "-length-min]").each(function(index, item){
				var item	= $(item);
				var length	= $(item).attr("data-" + defaultOptions.namespace + "-length-min");
				
				if(item.val().length < length)
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.minLength,
						error	: $.ambarFormsValidator.Validator.LENGTH_MIN
					});	
				}
			});
			
			// Controla la propiedad cantidad máxima de caracteres de un campo
			form.find("[data-" + defaultOptions.namespace + "-length-max]").each(function(index, item){
				var item	= $(item);
				var length	= $(item).attr("data-" + defaultOptions.namespace + "-length-max");
				
				if(item.val().length > length)
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.maxLength,
						error	: $.ambarFormsValidator.Validator.LENGTH_MAX
					});	
				}
			});

			// Controla la propiedad "igual a". Verifica si dos campos son iguales			
			form.find("[data-" + defaultOptions.namespace + "-equal-to]").each(function(index, item){
				var item	= $(item);
				var target	= $(item).attr("data-" + defaultOptions.namespace + "-equal-to");
				
				target		= $("#" + target);
				
				if(item.val() != target.val())
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.equalTo,
						error	: $.ambarFormsValidator.Validator.EQUAL_TO
					});	
				}
			});
			
			// Controla que el usuario haya seleccionado un valor en un campo select a través del valor por default
			form.find("[data-" + defaultOptions.namespace + "-default]").each(function(index, item){
				var item	= $(item);
				var valDef	= item.attr("data-" + defaultOptions.namespace + "-default");
				
				if(item.val() == valDef)
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.defaultOption,
						error	: $.ambarFormsValidator.Validator.SELECT_DEFAULT
					});	
				}
			});
			
			// Controla un campo a partir de una expresión regular
			form.find("[data-" + defaultOptions.namespace + "-format]").each(function(index, item){
				var item	= $(item);
				var exp		= item.attr("data-" + defaultOptions.namespace + "-format");
				var regex	= defaultOptions.expresions[exp];
				
				if(!regex.test(item.val()))
				{
					isValid	= false;
					errorsCollection.push({
						field	: item,
						message	: defaultOptions.errorMessages.format,
						error	: $.ambarFormsValidator.Validator.FORMAT
					});	
				}
			});
			
			return isValid;
		},
		
		// Realiza el envío del formulario. Invoca a la validación antes de realizar cualquier acción
		submit 	: function(event) {
			event.preventDefault();
			 
			var form = $(this).parent();
			
			if(methods.validate(form) == true)
			{				
				if(form.attr('data-' + defaultOptions.namespace +  '-post-ajax'))
				{
					//Envío del formulario vía AJAX
					var url		= form.attr("action");
					var method	= form.attr("method");
					var success	= form.attr("data-" + defaultOptions.namespace + "-ajax-success");
					var failure	= form.attr("data-" + defaultOptions.namespace + "-ajax-failure");
	
					if(typeof success == "string")
						success	= self[success];
					
					if(typeof failure == "string")
						failure	= self[failure];
	
					$.ajax({
						url		: url,
						type	: method,
						data	: form.serialize(),
						cache	: false,
						dataType: "json",
						success	: success,
						error	: failure
					});
				}
				else
				{
					//Envío vía POST tradicional
					form.submit();
				}	
			}
			else
			{				
				// Muestra los errores según la forma indicada por el usuario
				switch(defaultOptions.errorDisplay)
				{
					case $.ambarFormsValidator.Display.INSIDE			:
						methods.display_inside();
						break;
					case $.ambarFormsValidator.Display.OUTSIDE			:
						methods.display_outside();
						break;
					case $.ambarFormsValidator.Display.FIELDS_BEFORE	:
						methods.display_before();
						break;
					case $.ambarFormsValidator.Display.FIELDS_AFTER		:
						methods.display_after();
						break;
				}
			}
		},
		// Muestra los errores dentro del campo a validar		
		display_inside	: function() {
			$(errorsCollection).each(function(index, item){
				item.field.addClass(defaultOptions.errorClass);
				var msg	= defaultOptions.errorMessages[item.error];
				
				// En caso de los checkbox aplica el estilo sobre el label
				switch(item.field.attr("type"))
				{
					case "checkbox":
						var label	= item.field.attr("name");
						label		= $('label[for="' + label + '"]');

						label.addClass(defaultOptions.errorClass);
						label.attr("title", msg);
						break;
				}
				
				switch(item.error)
				{
					case $.ambarFormsValidator.Validator.CHECKBOX_MIN:
						var len	= item.field.attr("data-" + defaultOptions.namespace + "-check");
						
						if(len == 1)
							len	= len + " opción";
						else
							len	= len + " opciones";
						
						msg		= msg.replace("{0}", len);
						break;
					case $.ambarFormsValidator.Validator.LENGTH_MIN:
						var len	= item.field.attr("data-" + defaultOptions.namespace + "-length-min");
						
						if(len == 1)
							len = len + " caracter";
						else
							len = len + " caracteres";
						
						msg	= msg.replace("{0}", len);
						break;
					case $.ambarFormsValidator.Validator.LENGTH_MAX:
						var len	= item.field.attr("data-" + defaultOptions.namespace + "-length-max");
						
						if(len == 1)
							len = len + " caracter";
						else
							len = len + " caracteres";
						
						msg	= msg.replace("{0}", len);
						break;
					case $.ambarFormsValidator.Validator.EQUAL_TO:
						var parent	= item.field.attr("data-" + defaultOptions.namespace + "-equal-to");
						
						msg	= msg.replace("{0}", $('label[for="' + parent + '"]').html());
						msg	= msg.replace("{1}", $('label[for="' + item.field.attr("name") + '"]').html());
						break;
				}
				
				if(item.field.attr("title") == undefined)
					item.field.attr("title", msg);
				else
					item.field.attr("title", item.field.attr("title") + "\n" + msg);
			});
		},
		display_outside	: function() {
			console.log("V0.2 - Muestra los mensajes de error fuera del campo a través de un elemento span");
		},
		fields_before	: function() {
			console.log("V0.3 - Muestra los mensajes de error todos juntos al principio del formulario en un elemento div");
		},
		fields_after	: function() {
			console.log("V0.3 - Muestra los mensajes de error todos juntos al final del formulario en un elemento div");
		}
	};

	$.fn.ambarFormsValidator = function(method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.ambarFormsValidator');
		}
	};
	
	// Define las constantes de las validaciones a nivel global
	$.ambarFormsValidator	= {
		Validator	: {
			REQUIRED		: "required",
			LENGTH_MIN		: "minLength",
			LENGTH_MAX		: "maxLength",
			EQUAL_TO		: "equalTo",
			SELECT_DEFAULT	: "default",
			FORMAT			: "format",
			CHECKBOX_MIN	: "minCheckbox"
		},
		Display		: {
			INSIDE			: "inside",
			OUTSIDE			: "outside",
			FIELDS_BEFORE	: "before",
			FIELDS_AFTER	: "after"
		},
		version		: "0.1.0"
	} 
	
})(jQuery);
$(document).ambarFormsValidator();
