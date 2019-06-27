$(document).ready(function () {
	$('.registerform')
		.form({
			fields: {
				firstname: {
					identifier: 'firstname',
					rules: [{
						type: 'empty',
						prompt: 'Please enter your given name'
					}]
				},
				lastname: {
					identifier: 'lastname',
					rules: [{
						type: 'empty',
						prompt: 'Please enter your surname'
					}]
				},

				email: {
					identifier: 'email',
					rules: [{
						type: 'empty',
						prompt: 'Please enter your email'
					}, {

						type: 'regExp[/^$|^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/]',
						prompt: 'Please enter a valid email'
					}]
				},

				password: {
					identifier: 'password',
					rules: [{
						type: 'minLength[6]',
						prompt: 'Your password must be at least {ruleValue} characters long'
					}]
				},

				passwordagain: {
					identifier: 'passwordagain',
					rules: [{
							type: 'match[password]',
							prompt: 'Password don\'t match'
						},
						{
							type: 'empty'
						}
					]
				},

				checkbox: {
					identifier: 'checkbox',
					rules: [{
						type: 'checked',
						prompt: 'You must agree to the terms and conditions'
					}]
				}

			}
		});
});

$(document).ready(function () {
	$('.loginform')
		.form({
			fields: {
				email: {
					identifier: 'email',
					rules: [{
						type: 'empty',
						prompt: 'Please enter your email'
					}, {
						type: 'regExp[/^$|^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/]',
						prompt: 'Please enter a valid email'
					}]
				},

				password: {
					identifier: 'password',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a password'
					}]
				}

			}
		});
});

$(document).ready(function () {
	$('#editprofileform')
		.form({
			fields: {
				firstname: {
					identifier: 'firstname',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a first name'
					}]
				},
				lastname: {
					identifier: 'lastname',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a last name'
					}]
				},
				gender: {
					identifier: 'gender',
					rules: [{
						type: 'empty',
						prompt: 'Please select gender'
					}]
				},
				phonenum: {
					identifier: 'phonenum',
					rules: [{
						type: 'regExp[/^$|^[0-9]+$/]',
						prompt: 'Please enter a valid phone number'
					}, {
						type: 'maxLength[13]',
						prompt: 'Please enter a valid phone number'
					}]
				},
				postalcode: {
					identifier: 'postalcode',
					rules: [{
						type: 'regExp[/^$|^[0-9]+$/]',
						prompt: 'Please enter a valid postal code'
					}]
				},

				bio: {
					identifier: 'bio',
					rules: [{
						type: 'maxLength[5000]',
						prompt: 'Your biography is too long, maximum characters: {ruleValue}'
					}]
				}
			}
		});
});

$(document).ready(function () {
	$('#editprojectform')
		.form({
			fields: {
				projectname: {
					identifier: 'name',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a name for the project'
					}]
				},
				manager: {
					identifier: 'manager',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a project manager'
					}]
				},
				description: {
					identifier: 'description',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a description'
					}]
				},
				status: {
					identifier: 'status',
					rules: [{
						type: 'empty',
						prompt: 'Please select a status'
					}]
				}
			}
		});
});

$(document).ready(function () {
	$('#skillcategoryform')
		.form({
			fields: {
				name: {
					identifier: 'name',
					rules: [{
						type: 'empty',
						prompt: 'Please enter a name'
					}, {
						type: 'minLength[3]',
						prompt: 'Category name must contain between {ruleValue} and 30 characters'
					}]
				},
				color: {
					identifier: 'color',
					rules: [{
						type: 'regExp[^#[a-f0-9]{6}$|^#[a-f0-9]{3}$|^rgb\\((( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *),){2}( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *)\\)$]',
						prompt: 'Please enter a valid color'
					}]
				}
			}
		});
});

$(document).ready(function () {
	$('.settingsform')
		.form({
			fields: {
				email: {
					identifier: 'newemail',
					rules: [{
						type: 'regExp[/^$|^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/]',
						prompt: 'Please enter a valid email'
					}]
				},

				passwordLength: {
					identifier: 'newpassword',
					optional: true,
					rules: [{
						type: 'minLength[6]',
						prompt: '{name}  must be atleast {ruleValue} characters long.'
					}, {
						type: 'maxLength[160]',
						prompt: '{name} can\'t be more than {ruleValue} characters long.'
					}]
				},

				password: {
					identifier: 'newpasswordagain',
					rules: [{
						type: 'match[newpassword]',
						prompt: 'Password don\'t match'
					}]
				}

			}
		});
});

$(document).ready(function () {
	$('.modalform')
		.form({
			fields: {
				positions: {
					identifier: 'positions[]',
					rules: [{
						type: 'empty',
						prompt: 'Please select a position.'
					}]

				},

				skills: {
					identifier: 'skills[]',
					rules: [{
						type: 'empty',
						prompt: 'Please select atleast one skill.'
					}]

				},

				applicationtext: {
					identifier: 'applicationtext',
					rules: [{
						type: 'empty',
						prompt: 'Please write your application.'
					}]
				}

			}
		});
});

$(document).ready(function () {
	$('.suggestionform')
		.form({
			fields: {
				Project: {
					identifier: 'project',
					rules: [{
						type: 'empty',
						prompt: 'Please select a project'
					}]
				}
			}
		});
});






$.fn.form.settings.rules.passwordLimits = function (param) {
	// Your validation condition goes here
	return (param <= 10) ? true : false;
}