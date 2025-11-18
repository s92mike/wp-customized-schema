import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import {
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
	TextareaControl,
	Button,
	Notice,
	Spinner,
	Snackbar,
	TabPanel,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const SchemaEditor = () => {
	// State for global schema
	const [schemaData, setSchemaData] = useState({
		name: '',
		legalName: '',
		telephone: '',
		foundingDate: '',
		description: '',
		disambiguatingDescription: '',
		url: '',
		logo: '',
		image: '',
		streetAddress: '',
		addressLocality: '',
		addressRegion: '',
		postalCode: '',
		addressCountry: '',
		founders: [],
		sameAs: [],
		alternateName: [],
	});

	// State for internal schema
	const [internalSchemaData, setInternalSchemaData] = useState({
		'@id': 'https://www.dream.com/#dream',
		'name': 'Dream',
		'url': 'https://www.dream.com/',
	});

	const [notice, setNotice] = useState({ message: '', status: '' });
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [snackbar, setSnackbar] = useState({ message: '', type: '' });

	useEffect(() => {
		// Fetch both schema data
		setIsLoading(true);
		Promise.all([
			apiFetch({ path: '/dream/v1/schema' }),
			apiFetch({ path: '/dream/v1/default-schema' })
		])
			.then(([globalSchema, internalSchema]) => {
				setSchemaData(globalSchema);
				setInternalSchemaData(internalSchema);
				setIsLoading(false);
			})
			.catch((error) => {
				setNotice({
					message: __('Error loading schema data', 'fm-schema'),
					status: 'error',
				});
				setIsLoading(false);
			});
	}, []);

	const handleSave = async (type) => {
		try {
			setIsSaving(true);
			const endpoint = type === 'internal' ? '/dream/v1/default-schema' : '/dream/v1/schema';
			const data = type === 'internal' ? internalSchemaData : schemaData;
			
			await apiFetch({
				path: endpoint,
				method: 'POST',
				data: data,
			});
			
			const schemaType = type === 'internal' ? 'Internal' : 'Global';
			setNotice({
				message: __(`${schemaType} Schema data saved successfully`, 'fm-schema'),
				status: 'success',
			});
			setSnackbar({
				message: __(`${schemaType} Schema data saved successfully!`, 'fm-schema'),
				type: 'success'
			});
		} catch (error) {
			setNotice({
				message: __(`Error saving ${schemaType} Schema data`, 'fm-schema'),
				status: 'error',
			});
			setSnackbar({
				message: __(`Error saving ${schemaType} Schema data. Please try again.`, 'fm-schema'),
				type: 'error'
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddArrayItem = (field) => {
		setSchemaData({
			...schemaData,
			[field]: [...schemaData[field], ''],
		});
	};

	const handleRemoveArrayItem = (field, index) => {
		const newArray = [...schemaData[field]];
		newArray.splice(index, 1);
		setSchemaData({
			...schemaData,
			[field]: newArray,
		});
	};

	const handleArrayItemChange = (field, index, value) => {
		const newArray = [...schemaData[field]];
		newArray[index] = value;
		setSchemaData({
			...schemaData,
			[field]: newArray,
		});
	};

	const renderInternalSchema = () => (
        <>
            <Panel>
                <PanelBody 
                    title={__('Internal Pages Organization Schema', 'fm-schema')} 
                    opened={true}
                    className="dream-schema-editor-internal-panel"
                >
                    <div className="dream-schema-editor-internal-content">
                        <PanelRow>
                            <TextControl
                                label={__('Organization ID', 'fm-schema')}
                                value={internalSchemaData['@id']}
                                onChange={(value) => setInternalSchemaData({ ...internalSchemaData, '@id': value })}
                                disabled={isSaving}
                            />
                        </PanelRow>
                        <PanelRow>
                            <TextControl
                                label={__('Organization Name', 'fm-schema')}
                                value={internalSchemaData.name}
                                onChange={(value) => setInternalSchemaData({ ...internalSchemaData, name: value })}
                                disabled={isSaving}
                            />
                        </PanelRow>
                        <PanelRow>
                            <TextControl
                                label={__('Website URL', 'fm-schema')}
                                value={internalSchemaData.url}
                                onChange={(value) => setInternalSchemaData({ ...internalSchemaData, url: value })}
                                disabled={isSaving}
                            />
                        </PanelRow>
                    </div>
                </PanelBody>
            </Panel>
            <div className="dream-schema-editor-actions">
                <Button
                    isPrimary
                    onClick={() => {handleSave('internal')}}
                    disabled={isSaving}
                >
                    {__('Save Internal Schema', 'fm-schema')}
                </Button>
            </div>
        </>
	);

	const renderGlobalSchemaDisclaimer = () => (
		<div className="dream-schema-editor-disclaimer">
			<Notice status="info" isDismissible={false}>
				{__('This organization schema is only applied to the Homepage and About Page. It contains detailed information about the organization including founders, addresses, and social media links.', 'fm-schema')}
			</Notice>
		</div>
	);

	const renderInternalSchemaDisclaimer = () => (
		<div className="dream-schema-editor-disclaimer">
			<Notice status="info" isDismissible={false}>
				{__('This organization schema is applied to all internal pages (except Homepage and About Page). It contains basic organization information that appears across the site.', 'fm-schema')}
			</Notice>
		</div>
	);

	return (
		<div className="dream-schema-editor">
			{notice.message && (
				<Notice status={notice.status} onRemove={() => setNotice({ message: '', status: '' })}>
					{notice.message}
				</Notice>
			)}

			{isLoading ? (
				<div className="dream-schema-editor-loading">
					<Spinner />
					<p>{__('Loading schema data...', 'fm-schema')}</p>
				</div>
			) : (
				<TabPanel
					className="dream-schema-editor-tabs"
					activeClass="active-tab"
					tabs={[
						{
							name: 'global',
							title: __('Global Pages', 'fm-schema'),
							className: 'global-schema-tab',
						},
						{
							name: 'internal',
							title: __('Internal Pages', 'fm-schema'),
							className: 'internal-schema-tab',
						},
					]}
				>
					{(tab) => (
						<div>
							{tab.name === 'global' ? (
								<>
									{renderGlobalSchemaDisclaimer()}
									<Panel>
										<PanelBody title={__('Homepage/About Page Organization Schema', 'fm-schema')} initialOpen={true}>
											<PanelRow>
												<TextControl
													label={__('Organization Name', 'fm-schema')}
													value={schemaData.name}
													onChange={(value) => setSchemaData({ ...schemaData, name: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Legal Name', 'fm-schema')}
													value={schemaData.legalName}
													onChange={(value) => setSchemaData({ ...schemaData, legalName: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Telephone', 'fm-schema')}
													value={schemaData.telephone}
													onChange={(value) => setSchemaData({ ...schemaData, telephone: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Founding Date', 'fm-schema')}
													value={schemaData.foundingDate}
													onChange={(value) => setSchemaData({ ...schemaData, foundingDate: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextareaControl
													label={__('Description', 'fm-schema')}
													value={schemaData.description}
													onChange={(value) => setSchemaData({ ...schemaData, description: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextareaControl
													label={__('Disambiguating Description', 'fm-schema')}
													value={schemaData.disambiguatingDescription}
													onChange={(value) => setSchemaData({ ...schemaData, disambiguatingDescription: value })}
													disabled={isSaving}
												/>
											</PanelRow>
										</PanelBody>

										<PanelBody title={__('Founders', 'fm-schema')} initialOpen={false}>
											{schemaData.founders.map((founder, index) => (
												<PanelRow key={`founder-${index}`}>
													<TextControl
														label={__('Founder Name', 'fm-schema')}
														value={founder}
														onChange={(value) => handleArrayItemChange('founders', index, value)}
														disabled={isSaving}
													/>
													<Button
														isDestructive
														onClick={() => handleRemoveArrayItem('founders', index)}
														style={{ marginLeft: '8px' }}
														disabled={isSaving}
													>
														{__('Remove', 'fm-schema')}
													</Button>
												</PanelRow>
											))}
											<PanelRow>
												<Button isSecondary onClick={() => handleAddArrayItem('founders')} disabled={isSaving}>
													{__('Add Founder', 'fm-schema')}
												</Button>
											</PanelRow>
										</PanelBody>

										    <PanelBody title={__('Same As URLs', 'fm-schema')} initialOpen={false}>
											{schemaData.sameAs.map((url, index) => (
												<PanelRow key={`sameas-${index}`}>
													<TextControl
														label={__('URL', 'fm-schema')}
														value={url}
														onChange={(value) => handleArrayItemChange('sameAs', index, value)}
														disabled={isSaving}
													/>
													<Button
														isDestructive
														onClick={() => handleRemoveArrayItem('sameAs', index)}
														style={{ marginLeft: '8px' }}
														disabled={isSaving}
													>
														{__('Remove', 'fm-schema')}
													</Button>
												</PanelRow>
											))}
											<PanelRow>
												<Button isSecondary onClick={() => handleAddArrayItem('sameAs')} disabled={isSaving}>
													{__('Add URL', 'fm-schema')}
												</Button>
											</PanelRow>
										</PanelBody>

										<PanelBody title={__('Alternate Names', 'fm-schema')} initialOpen={false}>
											{schemaData.alternateName.map((name, index) => (
												<PanelRow key={`alternatename-${index}`}>
													<TextControl
														label={__('Alternate Name', 'fm-schema')}
														value={name}
														onChange={(value) => handleArrayItemChange('alternateName', index, value)}
														disabled={isSaving}
													/>
													<Button
														isDestructive
														onClick={() => handleRemoveArrayItem('alternateName', index)}
														style={{ marginLeft: '8px' }}
														disabled={isSaving}
													>
														{__('Remove', 'fm-schema')}
													</Button>
												</PanelRow>
											))}
											<PanelRow>
												<Button isSecondary onClick={() => handleAddArrayItem('alternateName')} disabled={isSaving}>
													{__('Add Alternate Name', 'fm-schema')}
												</Button>
											</PanelRow>
										</PanelBody>

										<PanelBody title={__('URLs and Media', 'fm-schema')} initialOpen={false}>
											<PanelRow>
												<TextControl
													label={__('Website URL', 'fm-schema')}
													value={schemaData.url}
													onChange={(value) => setSchemaData({ ...schemaData, url: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Logo URL', 'fm-schema')}
													value={schemaData.logo}
													onChange={(value) => setSchemaData({ ...schemaData, logo: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Image URL', 'fm-schema')}
													value={schemaData.image}
													onChange={(value) => setSchemaData({ ...schemaData, image: value })}
													disabled={isSaving}
												/>
											</PanelRow>
										</PanelBody>

										    <PanelBody title={__('Address Information', 'fm-schema')} initialOpen={false}>
											<PanelRow>
												<TextControl
													label={__('Street Address', 'fm-schema')}
													value={schemaData.streetAddress}
													onChange={(value) => setSchemaData({ ...schemaData, streetAddress: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('City', 'fm-schema')}
													value={schemaData.addressLocality}
													onChange={(value) => setSchemaData({ ...schemaData, addressLocality: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('State/Region', 'fm-schema')}
													value={schemaData.addressRegion}
													onChange={(value) => setSchemaData({ ...schemaData, addressRegion: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Postal Code', 'fm-schema')}
													value={schemaData.postalCode}
													onChange={(value) => setSchemaData({ ...schemaData, postalCode: value })}
													disabled={isSaving}
												/>
											</PanelRow>
											<PanelRow>
												<TextControl
													label={__('Country', 'fm-schema')}
													value={schemaData.addressCountry}
													onChange={(value) => setSchemaData({ ...schemaData, addressCountry: value })}
													disabled={isSaving}
												/>
											</PanelRow>
										</PanelBody>
									</Panel>
									<div className="dream-schema-editor-actions">
										<Button
											isPrimary
											onClick={() => handleSave('global')}
											disabled={isSaving}
										>
											{__('Save Global Schema', 'fm-schema')}
										</Button>
									</div>
								</>
							) : (
								<>
									{renderInternalSchemaDisclaimer()}
									{renderInternalSchema()}
								</>
							)}
						</div>
					)}
				</TabPanel>
			)}

			{snackbar.message && (
				<Snackbar
					className={snackbar.type === 'error' ? 'is-error' : 'is-success'}
					onRemove={() => setSnackbar({ message: '', type: '' })}
				>
					{snackbar.message}
				</Snackbar>
			)}
		</div>
	);
};

export default SchemaEditor; 