const $form = $('form#profile-picture-form'),
      $profilePictureSection = $form.find('.profile-picture-section'),
      $profilePictureInput = $profilePictureSection.find('#profile-picture'),
      $inavlidProfilePictureUpload = $profilePictureSection.find('.invalid-profile-picture-upload'),
      $profilePicturePreview = $profilePictureSection.find('.profile-picture-preview-details'),
      MAX_FILE_SIZE_MB = 1,
      MAX_IMG_SIDES_RATIO = 4

async function checkAndDisplayProfilePicture() {
	let isValid = true
	const profilePictureFile = $profilePictureInput[0].files[0]
	$profilePicturePreview[0].innerHTML = ''

	if (profilePictureFile) {
		const profilePictureSize = convertBytesToMb(profilePictureFile.size).toFixed(2),
		      reader = new FileReader(),
		      isProfilePictureOversize = (profilePictureSize > MAX_FILE_SIZE_MB),
		      invalidprofilePictureSizeClass = (isProfilePictureOversize) ? 'invalid-profile-picture-size' : ''

		if (isProfilePictureOversize) {
			alert("Фотография превышает допустимый вес. Максимально допустимый вес - " + MAX_FILE_SIZE_MB + " МБ")
			isValid = false
		}

		await new Promise(resolve => {
			reader.onload = function(event) {
				let profilePicture = new Image()
				profilePicture.src = URL.createObjectURL(profilePictureFile)

				profilePicture.onload = function() {
					const profilePictureWidth = this.naturalWidth,
					      profilePictureHeight = this.naturalHeight,
					      isProfilePictureAspectRatioTooBig = MAX_IMG_SIDES_RATIO < ((profilePictureWidth > profilePictureHeight) ?
					                                            profilePictureWidth / profilePictureHeight : profilePictureHeight / profilePictureWidth
					                                          ),
					      invalidProfilePictureSidesRatioClass = (isProfilePictureAspectRatioTooBig) ? 'invalid-profile-picture-sides-ratio' : ''

					if (isProfilePictureAspectRatioTooBig) {
						alert("Фотография имеет неверный формат. Максимальный коэффициент соотношения сторон фотографии - " + MAX_IMG_SIDES_RATIO)
						isValid = false
					}
			
					$profilePicturePreview[0].innerHTML += '<div class="uploaded-image">' +
					                                            '<div class="profile-picture-preview ' + invalidprofilePictureSizeClass + ' ' + invalidProfilePictureSidesRatioClass + '" style="background-image: url(' + event.target.result + ')"></div>' +
					                                       '</div>'
				}
				resolve()
			}
			reader.readAsDataURL(profilePictureFile)	 
		})
	}

	if ($profilePictureInput[0].files.length < 1) {
		$inavlidProfilePictureUpload.removeClass('d-none')
		isValid = false
	}
	else {
		$inavlidProfilePictureUpload.addClass('d-none')
	}

	return isValid
}

function convertBytesToMb(bytes) {
	return bytes / 1024 / 1024
}

$(function() {
	$profilePictureInput.val('')
})

$(document).on('change', '#profile-picture', checkAndDisplayProfilePicture)

$form.on('submit', function (event) {
	$(this).addClass('form-loading')
	event.preventDefault()
	event.stopPropagation()

	if (!$(this)[0].checkValidity()) {
		$(this).removeClass('form-loading').addClass('was-validated')
		$inavlidProfilePictureUpload.removeClass('d-none')
		return
	}

	let isCheckAndDisplayProfilePictureValid
	checkAndDisplayProfilePicture().then(value => isCheckAndDisplayProfilePictureValid = value)
	console.log(isCheckAndDisplayProfilePictureValid)
	if (!isCheckAndDisplayProfilePictureValid) {
		$(this).removeClass('form-loading')
		return
	}

	const url = $(this).attr('action'),
	      type = $(this).attr('method'),
	      formData = new FormData(),
	      dataArray = $(this).serializeArray(),
	      successMessage = $('.success-message')

	$.each(dataArray, function (i, val) {
		formData.append(val.name, val.value)
	})

	$.ajax({
		url: url,
		type: type,
		data: formData,
		dataType: "json",
		processData: false,
		success: function (response) {
			if (response.status === 'success') {
				$(this).remove()
				successMessage.removeClass('d-none')
			}
		},
		error: function (response) {
			$form.removeClass('form-loading')
		}
	})
	return false
})