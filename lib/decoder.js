var Iconv = require('iconv').Iconv;
var xsettings = require('x11-xsettings');

exports.decode = function(type, data) {
    var i;
    var result;
    var init = 0;
    switch (type) {
        case 'STRING':
            result = [];
            var converter = new Iconv('ISO-8859-1', 'UTF-8');
            for (i = 0; i < data.length; ++i) {
                if (data[i] === 0) {
                    result.push(converter.convert(data.slice(init, i)));
                    init = i + 1;
                }
            }

            if (init < data.length) {
                result.push(converter.convert(data.slice(init)));
            }
        break;

        case 'UTF8_STRING':
            result = [];
            for (i = 0; i < data.length; ++i) {
                if (data[i] === 0) {
                    result.push(data.toString('utf8', init, i));
                    init = i + 1;
                }
            }

            if (init < data.length) {
                result.push(data.toString('utf8', init));
            }
        break;

        case 'ATOM':
        case 'INTEGER':
  	case 'CARDINAL':
        case 'WINDOW':
            result = [];
            for (i = 0; i < data.length; i += 4) {
               result.push(data.readUInt32LE(i));
            }

        break;

        case 'WM_STATE':
            if (data.length !== 8) {
                result = new Error('Invalid WM_STATE data. Length: ' + data.length);
            } else {
                result = {
                    state : data.readUInt32LE(0),
                    icon : data.readUInt32LE(4)
                };
            }
        break;

        case '_XSETTINGS_SETTINGS':
            result = xsettings.decode(data);
        break;
        
        case "WM_SIZE_HINTS":
        	if(data.length != 72) return new Error("Invalid WM_SIZE_HINTS data. Length: "+data.length);
        	result = {
        		flags: data.readUInt32LE(0), // TODO: decode the flags
        		x: data.readUInt32LE(4), y: data.readUInt32LE(8),
        		width: data.readUInt32LE(12), height: data.readUInt32LE(16),
        		minWidth: data.readUInt32LE(20), minHeight: data.readUInt32LE(24),
        		maxWidth: data.readUInt32LE(28), maxHeight: data.readUInt32LE(32),
        		widthInc: data.readUInt32LE(36), heightInc: data.readUInt32LE(40),
        		minAspect: [data.readUInt32LE(44),data.readUInt32LE(48)],
        		maxAspect: [data.readUInt32LE(52),data.readUInt32LE(56)],
        		baseWidth: data.readUInt32LE(60), baseHeight: data.readUInt32LE(64),
        		winGravity: data.readUInt32LE(68)
        	};
        	break;
        case "WM_HINTS":
        	if(data.length != 36) return new Error("Invalid WM_HINTS data. Length: "+data.length);
        	result = {
        		flags: data.readUInt32LE(0),
        		input: data.readUInt32LE(4), initialState: data.readUInt32LE(8),
        		iconPixmap: data.readUInt32LE(12), iconWindow: data.readUInt32LE(16),
        		icon: [data.readUInt32LE(20),data.readUInt32LE(24)],
        		iconMask: data.readUInt32LE(28),
        		windowGroup: data.readUInt32LE(32)
        	};
        	break;

        default:
            result = new Error('Unsupported type: ' + type);
	}

    return result;
};
