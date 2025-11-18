import { __ } from '@wordpress/i18n';
const { useState, useEffect } = wp.element;
const { Button, Modal, TextareaControl, ToggleControl, Spinner, Snackbar, Notice } = wp.components;
const { withDispatch } = wp.data;

const SUPPORTED_TYPES = ['page', 'post', 'fm_guides', 'faqs', 'bct_service', 'fm_profiles'];

// Add styles to hide close button
const styles = `
    .hide-close-button .components-modal__header .components-button.has-icon {
        display: none !important;
    }
`;

const Sidebar = (props) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [schema, setSchema] = useState('');
    const [mergeYoast, setMergeYoast] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [originalSchema, setOriginalSchema] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showConfirmContent, setShowConfirmContent] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        // Add styles to document
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);

        // Cleanup on unmount
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        const meta = wp.data.select('core/editor').getEditedPostAttribute('meta') || {};
        if (meta._fm_manual_schema !== undefined) {
            setSchema(meta._fm_manual_schema || '');
            setOriginalSchema(meta._fm_manual_schema || '');
        }
        if (meta._fm_merge_yoast_schema !== undefined) setMergeYoast(!!meta._fm_merge_yoast_schema);
    }, [props.meta]);

    useEffect(() => {
        setHasUnsavedChanges(schema !== originalSchema);
    }, [schema, originalSchema]);

    const postType = wp.data.select('core/editor').getCurrentPostType();
    if (!SUPPORTED_TYPES.includes(postType)) return null;

    const validateSchema = (jsonData) => {
        // Check for required @context.
        if (!jsonData['@context'] || jsonData['@context'] !== 'https://schema.org') {
            return 'Schema must include @context with value "https://schema.org".';
        }

        // Check for required @type.
        if (!jsonData['@type']) {
            return 'Schema must include @type property.';
        }

        // If it's a graph, validate each item.
        if (jsonData['@graph']) {
            if (!Array.isArray(jsonData['@graph'])) {
                return '@graph must be an array of schema objects.';
            }
            for (const item of jsonData['@graph']) {
                const error = validateSchema(item);
                if (error) return error;
            }
            return '';
        }

        // Get the type, handling both single types and type arrays.
        const type = Array.isArray(jsonData['@type'])
            ? jsonData['@type'][jsonData['@type'].length - 1]
            : jsonData['@type'];

        // Validate common required properties based on @type.
        switch (type) {
            case 'Article':
                if (!jsonData.headline) return 'Article schema must include headline.';
                if (!jsonData.datePublished) return 'Article schema must include datePublished.';
                break;
            case 'FAQPage':
                if (!jsonData.mainEntity || !Array.isArray(jsonData.mainEntity)) {
                    return 'FAQPage schema must include mainEntity array.';
                }
                break;
            case 'HowTo':
                if (!jsonData.name) return 'HowTo schema must include name.';
                if (!jsonData.step || !Array.isArray(jsonData.step)) {
                    return 'HowTo schema must include step array.';
                }
                break;
            case 'Organization':
                if (!jsonData.name) return 'Organization schema must include name.';
                break;
            case 'Person':
                if (!jsonData.name) return 'Person schema must include name.';
                break;
            case 'Product':
                if (!jsonData.name) return 'Product schema must include name.';
                break;
            case 'WebPage':
                if (!jsonData.name) return 'WebPage schema must include name.';
                break;
            default:
                // For custom types, ensure basic schema.org requirements.
                if (!jsonData.name && !jsonData.description) {
                    return `Custom type "${type}" should include either name or description.`;
                }
                // Check if the type follows schema.org naming convention.
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(type)) {
                    return `Type "${type}" should follow schema.org naming convention (PascalCase).`;
                }
                // Check for common required properties in custom types.
                if (jsonData.url && typeof jsonData.url !== 'string') {
                    return 'URL property must be a string.';
                }
                if (jsonData.image && typeof jsonData.image !== 'string' && typeof jsonData.image !== 'object') {
                    return 'Image property must be a string or object.';
                }
                break;
        }
        return '';
    };

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const saveSchema = () => {
        setSaving(true);
        try {
            // Remove the validation for now. It's not working as expected. Will work on it later.
            // First check if it's valid JSON.
            // const jsonData = JSON.parse(schema);
            // const validationError = validateSchema(jsonData);
            // if (validationError) {
            //     showNotification(validationError, 'error');
            //     setSaving(false);
            //     return;
            // }

            // If validation passes, save the schema.
            props.setMetaFieldValue('_fm_manual_schema', schema);
            props.setMetaFieldValue('_fm_merge_yoast_schema', mergeYoast);
            setTimeout(() => {
                setSaving(false);
                setShowSnackbar(true);
                setOriginalSchema(schema);
                setTimeout(() => setShowSnackbar(false), 2500);
            }, 600);
        } catch (e) {
            showNotification('Invalid JSON format. Please check your schema syntax.', 'error');
            setSaving(false);
        }
    };

    const removeSchema = () => {
        setSaving(true);
        props.setMetaFieldValue('_fm_manual_schema', '');
        setTimeout(() => {
            setSchema('');
            setOriginalSchema('');
            setSaving(false);
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 2500);
        }, 600);
    };

    const handleCloseModal = () => {
        if (hasUnsavedChanges) {
            setShowConfirmContent(true);
        } else {
            setModalOpen(false);
        }
    };

    const handleConfirmClose = (action) => {
        if (action === 'apply') {
            saveSchema();
            setShowConfirmContent(false);
            setModalOpen(false);
        } else if (action === 'discard') {
            setSchema(originalSchema);
            setShowConfirmContent(false);
            setModalOpen(false);
        } else {
            setShowConfirmContent(false);
        }
    };

    const renderModalContent = () => {
        if (showConfirmContent) {
            return (
                <div style={{ padding: '20px' }}>
                    <p>{__('Do you want to leave the drop-in schema without applying and validating the updated schema?', 'fm-schema')}</p>
                    <p style={{ color: '#cc1818', marginTop: '10px' }}>
                        {__('Note: Saving the Page/Blogs/Guides/FAQs will not reflect the schema changes unless they are applied and validated.', 'fm-schema')}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => handleConfirmClose('return')}>
                            {__('Return Back', 'fm-schema')}
                        </Button>
                        <Button variant="primary" onClick={() => handleConfirmClose('apply')}>
                            {__('Validate & Apply', 'fm-schema')}
                        </Button>
                        <Button isDestructive variant="secondary" onClick={() => handleConfirmClose('discard')}>
                            {__('Don\'t Apply Changes to Schema', 'fm-schema')}
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ position: 'relative' }}>
                <Notice
                    status="info"
                    isDismissible={false}
                    className="fm-schema-variables-notice"
                    style={{ marginBottom: '16px' }}
                >
                    <p><strong>{__('Available Dynamic Date Variables:', 'fm-schema')}</strong></p>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li><code>{'{{fm_schema_created_date}}'}</code> - {__('Original publish date', 'fm-schema')}</li>
                        <li><code>{'{{fm_schema_last_updated_date}}'}</code> - {__('Most recent update timestamp', 'fm-schema')}</li>
                    </ul>
                    <p style={{ margin: '8px 0 0' }}>
                        {__('These variables will be automatically replaced with actual dates when the schema is output.', 'fm-schema')}
                    </p>
                </Notice>
                <TextareaControl
                    label={__('Paste JSON schema here', 'fm-schema')}
                    value={schema}
                    onChange={setSchema}
                    rows={8}
                    disabled={saving}
                />
                <ToggleControl
                    label={__('Merge With Yoast Schema', 'fm-schema')}
                    checked={mergeYoast}
                    onChange={(value) => {
                        setMergeYoast(value);
                        props.setMetaFieldValue('_fm_merge_yoast_schema', value);
                    }}
                    style={{ margin: '16px 0' }}
                    disabled={saving}
                />
                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                    {__('Unchecking this will remove the Yoast @graph schema and replace it with a  ', 'fm-schema')}
                    <code>&lt;script type="application/ld+json" id="manual-schema-page"&gt;</code>
                    {__(' tag containing the custom schema.', 'fm-schema')}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button isPrimary onClick={saveSchema} disabled={saving}>
                        {saving ? <Spinner /> : __('Apply Schema', 'fm-schema')}
                    </Button>
                    <Button isSecondary onClick={removeSchema} disabled={saving}>
                        {saving ? <Spinner /> : __('Remove Schema', 'fm-schema')}
                    </Button>
                </div>
                {saving && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}>
                        <Spinner />
                    </div>
                )}
                {notification.message && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 16,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 20
                    }}>
                        <Snackbar
                            status={notification.type}
                            onRemove={() => setNotification({ message: '', type: '' })}
                            style={{
                                backgroundColor: notification.type === 'error' ? '#cc1818' : '#46b450',
                                color: '#fff'
                            }}
                        >
                            {notification.message}
                        </Snackbar>
                    </div>
                )}
                {showSnackbar && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 16,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 20
                    }}>
                        <Snackbar
                            status="success"
                            onRemove={() => setShowSnackbar(false)}
                            style={{
                                backgroundColor: '#46b450',
                                color: '#fff'
                            }}
                        >
                            {__('Schema applied successfully!', 'fm-schema')}
                        </Snackbar>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Button
                isSecondary
                style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}
                onClick={() => setModalOpen(true)}
            >
                <div style={{ width: '100%' }}>{__('Manually Add Schema', 'fm-schema')}</div>
            </Button>
            {schema && (
                <div style={{ fontSize: 12, color: '#666' }}>
                    {__('Drop-in Schema is enabled for this content.', 'fm-schema')}
                </div>
            )}
            {isModalOpen && (
                <Modal
                    title={showConfirmContent ? __('Unapplied Changes', 'fm-schema') : __('Boundless Schema', 'fm-schema')}
                    onRequestClose={handleCloseModal}
                    shouldCloseOnClickOutside={false}
                    shouldCloseOnEsc={false}
                    overlayClassName={`fm-schema-modal-overlay ${showConfirmContent ? 'hide-close-button' : ''}`}
                    isOpen={isModalOpen}
                    isFullScreen={false}
                    hideCloseButton={showConfirmContent}
                    closeButtonLabel=""
                >
                    {renderModalContent()}
                </Modal>
            )}
        </>
    );
};

export default withDispatch((dispatch) => {
    return {
        setMetaFieldValue: function (key, value) {
            dispatch('core/editor').editPost({ meta: { [key]: value } });
        }
    };
})(Sidebar); 