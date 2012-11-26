# jQuery Ambar Forms Validator

Plugin para jQuery que permite realizar validaciones de formularios de forma sencilla.

Utiliza los atributos data de HTML5 para configurar el plugin

## Changelog

### V0.2.31
Corrección del error #2.

### V0.2.3
Se agregó la posibilidad de visualizar los mensajes de error agrupados en la parte superior o inferior del formulario

### V0.2.2
Se agregó la funcionalidad que permite realizar las siguientes funciones:

+ Agregar la posibilidad de personalizar los mensajes de error para cada campo

### V0.2.1
Se agregó la funcionalidad que permite realizar las siguientes validaciones:

+ Grupo de checkbox
+ Grupo de radio buttons

### V0.2.0
Se agregó la funcionalidad que permite realizar las siguientes validaciones:

+ Checkbox individuales

### V0.1.0
Versión inicial del plugin. Posee sólo funcionalidades básicas que actúan sobre los siguientes tipos de campos

+ Todos los input menos checkbox y radio;
+ Select (sólo desplegables);
+ Todo tipo de elementos HTML para disparar la validación y posterior envío del formulario (vía GET, POST o AJAX);

Realiza los siguientes tipos de validaciones

+ Campo obligatorio (valida los select a través de la comparación de la opción por defecto);
+ Cantidad mínima y/o máxima de caracteres;
+ Igualdad de valores entre dos campos;
+ Validaciones de formato (email, url, sólo texto, solo números, texto extendido)

Los mensajes de error momentáneamente sólo se muestran marcando el campo con una clase css de error y cargando los mensajes de error en el atributo title del campo en cuestión.