/**
 * jQuery - Ambar Forms Validator
 *
 * @author Javier Trejo @ JT - Comunicación Interactiva
 * @version 0.1.0
 * @see https://github.com/jt-comunicacioninteractiva/jquery-afv
 *
 * Este plugin se utiliza para validar formularios antes de ser enviados al
 * servidor.
 * Se inicia a si mismo por lo que no es necesario invocarlo y se vale de
 * los atributos data-afv-* y los atributos estandar de HTML para la
 * configuración.
 *
 */
(function($) {
	var defaultOptions = {
		namespace : 'afv',
		expresions:	{
			email			: /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)$/,
			url				: /((http\:\/\/|https\:\/\/|ftp\:\/\/)|(www.))+(([a-zA-Z0-9\.-]+\.[a-zA-Z]{2,4})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(\/[a-zA-Z0-9%:\/-_\?\.'~]*)?/,
			string			: /^[a-zA-Z]+$/,
			number			: /^\s*\d+\s*$/,
			extendedString	: /^[-\sa-zA-Z0-9]+$/
		}
	};

	var methods = {
		init 	: function(options) {
			$.extend(defaultOptions, options);
			
			$(document).ready(function(){
				$('[data-' + defaultOptions.namespace + '-validate=true]')
					.find('[data-' + defaultOptions.namespace + '-role=submit]')
					.bind('click', methods.submit);
			});
		},
		validate: function(form) {
			var isValid	= true;
			
			form.find("[data-" + defaultOptions.namespace + "-required]").each(function(index, item){
				var item	= $(item);
				
				if(item.val().length == 0)
					isValid	= false;
			});
			
			form.find("[data-" + defaultOptions.namespace + "-length-min]").each(function(index, item){
				var item	= $(item);
				var length	= $(item).attr("data-" + defaultOptions.namespace + "-length-min");
				
				if(item.val().length < length)
					isValid	= false;
			});
			
			form.find("[data-" + defaultOptions.namespace + "-length-max]").each(function(index, item){
				var item	= $(item);
				var length	= $(item).attr("data-" + defaultOptions.namespace + "-length-max");
				
				if(item.val().length > length)
					isValid	= false;
			});
			
			form.find("[data-" + defaultOptions.namespace + "-equal-to]").each(function(index, item){
				var item	= $(item);
				var target	= $(item).attr("data-" + defaultOptions.namespace + "-equal-to");
				
				target		= $("#" + target);
				
				if(item.val() != target.val())
					isValid	= false;
			});
			
			form.find("[data-" + defaultOptions.namespace + "-default]").each(function(index, item){
				var item	= $(item);
				var valDef	= item.attr("data-" + defaultOptions.namespace + "-default");
				
				if(item.val() == valDef)
					isValid	= false;	
			});
			
			form.find("[data-" + defaultOptions.namespace + "-format]").each(function(index, item){
				var item	= $(item);
				var exp		= item.attr("data-" + defaultOptions.namespace + "-format");
				var regex	= defaultOptions.expresions[exp];
				
				if(!regex.test(item.val()))
					isValid	= false;
			});
			
			return isValid;
		},
		submit 	: function(event) {
			event.preventDefault();
			 
			var form = $(this).parent();
			
			if(methods.validate(form) == true)
			{				
				if(form.attr('data-' + defaultOptions.namespace +  '-post-ajax'))
				{
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
					form.submit();
				}	
			}
			else
			{
				//TODO : Armar la lógica para que el desarrollador pueda configurar la forma de mostrar los mensajes al usuario.
				console.log("Hacer algo para que se pueda informar al usuario del resultado");
			}
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

})(jQuery);
$(document).ambarFormsValidator();
