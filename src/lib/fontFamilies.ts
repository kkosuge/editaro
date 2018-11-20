import * as fontManager from 'font-manager'
const fonts = fontManager.findFontsSync({ monospace: true })
export default fonts.map(font => font['postscriptName']).sort()
