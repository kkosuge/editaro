declare module 'font-manager' {
  export function findFontsSync(
    param: any
  ): {
    path: string
    postscriptName: string
    family: string
    style: string
    weight: number
    width: number
    italic: boolean
    monospace: boolean
  }[]
}
