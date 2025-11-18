import { render } from '@wordpress/element';
import SchemaEditor from './components/SchemaEditor';

// Render the Schema Editor component
render(
	<SchemaEditor />,
	document.getElementById( 'dream-schema-editor' )
);
